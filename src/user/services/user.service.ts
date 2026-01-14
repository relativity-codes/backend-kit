import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../models/user.model';
import * as jwt from 'jsonwebtoken';
import { Op, WhereOptions } from 'sequelize';
import { UserSearchDto } from '../dto/user-search.dto';
import { MailService } from '../../email/email.service';
import { WalletService } from '../../wallet/services/wallet.service';
import { UserStatusEnum } from '../../shared-types/UserStatusEnum';
import { RoleEnum } from '../../shared-types/RoleEnum';
import stringify from "safe-stable-stringify";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly emailService: MailService,
    private readonly walletService: WalletService,
  ) { }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashedPassword = await this.hashPassword(newPassword);
    await this.userModel.update(
      { password: hashedPassword },
      { where: { id: userId } },
    );

    await this.emailService.resetPasswordSuccessfulEmail({
      userEmail: user.email,
      userName: user.username,
    });
  }

  async verifyEmail(userId: string): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userModel.update(
      { isEmailVerified: true },
      { where: { id: userId } },
    );
  }

  async findAll(searchDto: UserSearchDto): Promise<User[]> {
    try {
      const { offset = 0, limit = 10, ...searchParams } = searchDto;

      const where: WhereOptions<User> = {};

      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          switch (key) {
            case 'username':
            case 'email':
            case 'fullName':
              where[key] = { [Op.iLike]: `%${value}%` };
              break;
            case 'role':
              where[key] = RoleEnum[value as keyof typeof RoleEnum];
              break;
            case 'status':
              where[key] = UserStatusEnum[value as keyof typeof UserStatusEnum];
              break;
            default:
              where[key] = value;
          }
        }
      });

      const users = await this.userModel.findAll({
        where,
        offset,
        limit,
        order: [['createdAt', 'DESC']],
        include: []
      });

      const usersWithCounts = users.map(user => {
        const plainUser = user.toJSON();
        return {
          ...plainUser,
          quizCount: plainUser.quizRecords ? plainUser.quizRecords.length : 0,
          lessonCount: plainUser.lessons ? plainUser.lessons.length : 0,
        };
      });

      return [...new Set(usersWithCounts.map((a) => stringify(a)))].map((e) =>
        JSON.parse(e),
      );
    } catch (error) {
      throw new BadRequestException({
        message: 'Error fetching users',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async findOneByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { username },
      include: []
    });
    if (!user) {
      throw new NotFoundException(`User with username '${username}' not found`);
    }
    return user;
  }

  async findOneByUsernameMiddleware(username: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { username },
      include: []
    });
    if (!user) {
      throw new NotFoundException(`User with username '${username}' not found`);
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { email },
      include: []
    });
    if (!user) {
      throw new NotFoundException(`User with email '${email}' not found`);
    }
    return user;
  }

  async findOneByEmailReg(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { email },
      include: []
    });
    if (!user) {
      return null;
    }
    return user;
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      include: []
    });
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
    return user;
  }

  async findAllByReferralUsername(referralUsername: string) {
    const user = await this.userModel.findAll({
      order: [['createdAt', 'DESC']],
      where: { referral: referralUsername },
      include: []
    });
    if (!user || user.length === 0) {
      return [];
    }
    return user;
  }

  async create(createUserDto: CreateUserDto, x = null): Promise<User> {
    const { email, password, ...rest } = createUserDto;

    const existingUser = await this.userModel.findOne({ where: { email } });

    if (existingUser) {
      throw new BadRequestException('Email is already taken');
    }

    // Generate a unique username from the email prefix
    let username = createUserDto.username || email.split('@')[0];
    let count = 1;
    while (await this.userModel.findOne({ where: { username } })) {
      username = `${email.split('@')[0]}${count}`;
      count++;
    }

    // Hash the password before saving
    const hashedPassword = await this.hashPassword(password);

    // Create and save the user
    try {
      let newUser: void | User;
      if (x !== null) {
        newUser = await this.userModel.create(
          {
            ...rest,
            email,
            username,
            password: hashedPassword,
          },
          x,
        );
      } else {
        newUser = await this.userModel.create({
          ...rest,
          email,
          username,
          password: hashedPassword,
        });
      }

      if (newUser) {
        const verificationToken = await this.generateEmailVerificationToken(
          newUser.id,
        );

        await this.emailService.sendVerificationEmail({
          userEmail: email,
          link: `${process.env.FRONTEND_URL}/activate?token=${verificationToken}`,
        });

        // Create a wallet for the user (best-effort; log failures but do not block user creation)
        try {
          await this.walletService.findOrCreateForUser(newUser.id);
        } catch (walletErr) {
          console.error('Failed to create wallet for new user:', stringify({
            userId: newUser.id,
            message: walletErr?.message,
            stack: walletErr?.stack,
          }));
        }
      }
      return newUser ? newUser : null;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error creating the user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async generateEmailVerificationToken(userId: string): Promise<string> {
    const secretKey =
      process.env.EMAIL_VERIFICATION_SECRET || 'default-reset-password-secret';
    return jwt.sign({ sub: userId }, secretKey, { expiresIn: '1h' });
  }

  async update(
    id: string,
    updatedUserDto: UpdateUserDto,
    userId: string,
  ): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID \'${id}\' not found`);
    }
    const adminCheck = await this.userModel.findOne({
      where: { id: userId },
    });
    if (
      !(
        user.id === userId || ['ADMIN', 'SUPER_ADMIN'].includes(adminCheck.role)
      )
    ) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }
    let updatedUserData = { ...updatedUserDto };
    if (updatedUserDto.role &&
      !['ADMIN', 'SUPER_ADMIN'].includes(adminCheck.role)
    ) {
      updatedUserData = {
        ...updatedUserDto,
        role: user.role,
      };
    }
    if (['ADMIN', 'SUPER_ADMIN'].includes(adminCheck.role)) {
      updatedUserData = {
        ...updatedUserDto,
        role: updatedUserDto.role || user.role,
      };
    }

    try {
      await this.userModel.update(updatedUserData, { where: { id } });
      const updatedUser = await this.findOneById(id);
      return updatedUser;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error updating the user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }

  async delete(id: string): Promise<User> {
    const userToRemove = await this.findOneById(id);
    if (!userToRemove) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }

    try {
      await userToRemove.destroy();
      return userToRemove;
    } catch (error) {
      throw new BadRequestException({
        message: 'Error deleting the user',
        details: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      });
    }
  }
}
