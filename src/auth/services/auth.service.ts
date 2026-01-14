import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as jwt from 'jsonwebtoken';
import { User } from '../../user/models/user.model';
import { UpdateUserDto } from '../../user/dto/update-user.dto';
import { UserService } from '../../user/services/user.service';
import * as dotenv from 'dotenv';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { MailService } from '../../email/email.service';
import { OAuth2Client } from 'google-auth-library';
import * as jwksClient from 'jwks-rsa';
import { Op } from 'sequelize';
import { PasswordResetOtp } from '../models/password-reset-otp.model';
import { EmailVerificationOtp } from '../models/email-verification-otp.model';
import { InjectModel } from '@nestjs/sequelize';

dotenv.config();

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  constructor(
    private readonly userService: UserService,
    private readonly emailService: MailService,
    @InjectModel(EmailVerificationOtp)
    private readonly emailVerificationOtpModel: typeof EmailVerificationOtp,
    @InjectModel(PasswordResetOtp)
    private readonly passwordResetOtpModel: typeof PasswordResetOtp,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isPasswordValid = await this.userService.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    return user;
  }

  async validateIsAdmin(userId: string): Promise<boolean> {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new UnauthorizedException('Admin validation user not found');
    }
    return ['SUPER_ADMIN', 'ADMIN'].includes(user.role);
  }

  validateUserById(id: string): Promise<User> {
    return this.userService.findOneById(id);
  }

  validateUserByUsername(username: string): Promise<User> {
    return this.userService.findOneByUsername(username);
  }

  validateUserByUsernameMiddleware(Username: string): Promise<User> {
    return this.userService.findOneByUsernameMiddleware(Username);
  }

  generateTwoFactorSecret(): string {
    const secret = speakeasy.generateSecret({ length: 20 });
    return secret.otpauth_url;
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    const user = await this.validateUser(email, password);
    const token = await this.generateJwtToken(user);
    return { user, token };
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto);
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const decodedToken: any = jwt.verify(
        token,
        process.env.EMAIL_VERIFICATION_SECRET,
      );
      const userId = decodedToken.sub;
      await this.userService.verifyEmail(userId);
    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async sendResetPasswordEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.emailService.sendForgotPasswordEmail({
      userEmail: email,
      userName: user.username,
      link: resetPasswordLink,
    });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const resetToken = await this.generateResetPasswordToken(user.id);
    await this.sendResetPasswordEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decodedToken: any = jwt.verify(
        token,
        process.env.RESET_PASSWORD_SECRET,
      );

      if (decodedToken.exp && Date.now() >= decodedToken.exp * 1000) {
        throw new BadRequestException('Reset password token has expired');
      }

      const userId = decodedToken.sub;
      await this.userService.updatePassword(userId, newPassword);
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset password token');
    }
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const userRetrieve = await this.userService.findOneById(userId);
      const user = await this.validateUser(userRetrieve.email, oldPassword);
      if (!user) {
        throw new NotFoundException('User credential compromised');
      }
      await this.userService.updatePassword(userId, newPassword);
    } catch (error) {
      throw new BadRequestException('Invalid or incorrect old password');
    }
  }

  private async generateJwtToken(user: User): Promise<string> {
    const payload = { username: user.username, sub: user.id };
    const secretKey = process.env.JWT_SECRET_KEY || 'default-secret-key';
    return jwt.sign(payload, secretKey, { expiresIn: '30d' });
  }

  private async generateResetPasswordToken(userId: string): Promise<string> {
    const secretKey =
      process.env.RESET_PASSWORD_SECRET || 'default-reset-password-secret';
    return jwt.sign({ sub: userId }, secretKey, { expiresIn: process.env.JWT_EXPIRATION_TIME || '1h' });
  }

  async generateEmailVerificationToken(userId: string): Promise<string> {
    const secretKey =
      process.env.EMAIL_VERIFICATION_SECRET || 'default-reset-password-secret';
    return jwt.sign({ sub: userId }, secretKey, { expiresIn: '1h' });
  }

  async updateProfile(
    id: string,
    updateUserDto: UpdateUserDto,
    userId: string,
  ): Promise<User> {
    const existingUser = await this.userService.findOneById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const data = Object.assign(existingUser, updateUserDto);
    const updateUserData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );
    return this.userService.update(id, updateUserData as any, userId);
  }

  verifyTwoFactorToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
  }

  async loginWithGoogle(idToken: string): Promise<{ user: User; token: string }> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new BadRequestException('Invalid Google token');
    }

    const email = payload.email;
    let user = await this.userService.findOneByEmail(email);

    const timestamp = Date.now().toString(36);
    const uniqueId = `autogen-${timestamp}`

    if (!user) {
      user = await this.userService.create({
        username: payload.name || email.split('@')[0],
        email,
        provider: 'google',
        providerId: payload.sub, // Google user ID
        avatar: payload.picture,
        password: uniqueId,
        firstName: payload.given_name || (payload.name ? payload.name.split(' ')[0] : email.split('@')[0]),
        lastName: payload.family_name || (payload.name ? payload.name.split(' ').slice(1).join(' ') : 'update'),
        isEmailVerified: true,
      } as any);
    }

    const token = await this.generateJwtToken(user);
    return { user, token };
  }


  async loginWithApple(idToken: string, userName?: { firstName?: string; lastName?: string }): Promise<{ user: User; token: string }> {
    const client = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });

    function getKey(header, callback) {
      client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err, null);
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      });
    }

    const decoded: any = await new Promise((resolve, reject) => {
      jwt.verify(
        idToken,
        getKey,
        { algorithms: ['RS256'] },
        (err, decoded) => (err ? reject(err) : resolve(decoded)),
      );
    });

    const email = decoded.email;
    if (!email) {
      throw new BadRequestException('Apple ID token does not contain email');
    }

    let user = await this.userService.findOneByEmail(email);

    const timestamp = Date.now().toString(36);
    const uniqueId = `autogen-${timestamp}`

    if (!user) {
      user = await this.userService.create({
        username: email.split('@')[0],
        email,
        provider: 'apple',
        providerId: decoded.sub,
        avatar: '',
        password: uniqueId,
        firstName: userName?.firstName || email.split('@')[0],
        lastName: userName?.lastName || 'update',
        isEmailVerified: true,
      } as any);
    }

    const token = await this.generateJwtToken(user);
    return { user, token };
  }



  /**
   * Generates a 6-digit OTP for email verification, saves it to a new table, and returns the OTP.
   * Uses email instead of userId.
   */
  async generateEmailVerificationOtp(email: string): Promise<string> {
    // Generate a 6-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Set expiry time (e.g., 10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to a new table (assumes EmailVerificationOtp model exists)
    await this.emailVerificationOtpModel.create({
      email,
      otp,
      expiresAt,
      verified: false,
    });

    await this.emailService.sendEmailVerificationOtp({
      userEmail: email,
      otp,
    });

    return otp;
  }

  /**
   * Verifies the OTP for email verification.
   * Marks the OTP as used and sets the user's email as verified if successful.
   */
  async verifyEmailOtp(email: string, otp: string): Promise<boolean> {
    // Find OTP record
    const otpRecord = await this.emailVerificationOtpModel.findOne({
      where: {
        email,
        otp,
        verified: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await otpRecord.update({ verified: true });

    // Mark user's email as verified
    // await this.userModel.update(
    //   { isEmailVerified: true },
    //   { where: { email } },
    // );

    return true;
  }

  /**
   * Generates a 6-digit OTP for password reset, saves it to a new table, and returns the OTP.
   * Uses email as the identifier.
   */
  async generatePasswordResetOtp(email: string): Promise<string> {
    // Generate a 6-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Set expiry time (e.g., 10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP to a new table (assumes PasswordResetOtp model exists)
    await this.passwordResetOtpModel.create({
      email,
      otp,
      expiresAt,
      used: false,
    });

    await this.emailService.sendPasswordResetOtp({
      userEmail: email,
      otp,
    });

    return otp;
  }

  /**
   * Verifies the OTP for password reset.
   * Marks the OTP as used and allows password reset if successful.
   */
  async verifyPasswordResetOtp(email: string, otp: string): Promise<boolean> {
    // Find OTP record
    const otpRecord = await this.passwordResetOtpModel.findOne({
      where: {
        email,
        otp,
        used: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await otpRecord.update({ used: true });

    return true;
  }

  /**
   * Resets the user's password using a valid OTP.
   */
  async resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<void> {
    // Verify OTP
    await this.verifyPasswordResetOtp(email, otp);
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user's password
    await this.userService.updatePassword(user.id, newPassword);
  }


}
