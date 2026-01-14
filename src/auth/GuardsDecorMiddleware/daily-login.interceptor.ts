/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DailyLoginRecord } from '../models/daily-login-record.model';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/services/user.service';
import { UserStatusEnum } from 'src/shared-types/UserStatusEnum';

@Injectable()
export class DailyLoginInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(DailyLoginRecord)
    private readonly dailyLoginRecordModel: typeof DailyLoginRecord,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
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
    if (userId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this.dailyLoginRecordModel
        .findOrCreate({
          where: { userId, loggingAt: today },
          defaults: { userId, loggingAt: today },
        })
        .catch((err) => {
          console.error('Error creating daily login record', err);
        });
      this.userService.findOneById(userId).then((user) => {
        if (user) {
          user.lastLoginAt = new Date();
          user.save().catch((err) => {
            console.error('Error updating last login date', err);
          });
          if (user.status === UserStatusEnum.SUSPENDED) {
            throw new Error(
              'Your account is suspended. Please contact support.',
            );
          }
        }
      });
    }
    return next.handle();
  }
}
