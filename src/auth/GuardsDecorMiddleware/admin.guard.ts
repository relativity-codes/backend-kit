/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleEnum } from 'src/shared-types/RoleEnum';
import { User } from 'src/user/models/user.model';

/**
 * Guard to allow only users with ADMIN or SUPER_ADMIN roles.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    let userId: string | null = null;
    if (token) {
      try {
        const decoded = this.jwtService.verify(token);
        userId = decoded.sub;
      } catch (error) {
        console.error('JWT validation failed', error);
      }
    }

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }
    const user = await User.findByPk(userId);
    if (!user) {
      throw new ForbiddenException('User not found');
    }
    if (user.role === RoleEnum.ADMIN || user.role === RoleEnum.SUPER_ADMIN) {
      return true;
    }
    throw new ForbiddenException('Admin privileges required');
  }
}
