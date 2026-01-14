import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DailyUserActivities } from '../models/daily-user-activities.model';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class DailyUserActivitiesInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(DailyUserActivities)
    private readonly activitiesModel: typeof DailyUserActivities,
    private readonly jwtService: JwtService
  ) { }

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
      const now = new Date();
      const activityDay = new Date(now);
      activityDay.setHours(0, 0, 0, 0);
      const record = {
        userId,
        activityDay,
        fullTimestamp: now,
        routeVisited: request.url,
        actionPerformed: request.method,
        modulueName: context.getClass().name,
        modelClassName: context.getClass().name,
        methodName: context.getHandler().name,
        ipAddress: request.ip || request.headers['x-forwarded-for'] || request.connection?.remoteAddress,
      };
      this.activitiesModel.create(record).catch(() => { });
    }
    return next.handle();
  }
}