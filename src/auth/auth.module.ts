import { Global, Module, forwardRef } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { DailyLoginRecordController } from './controllers/daily-login-record.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { DailyLoginRecordService } from './services/daily-login-record.service';
import { LocalStrategy } from './GuardsDecorMiddleware/local.strategy';
import { JwtStrategy } from './GuardsDecorMiddleware/jwt.strategy';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AdminGuard } from './GuardsDecorMiddleware/admin.guard';
import { DailyUserActivitiesInterceptor } from './GuardsDecorMiddleware/daily-user-activities.interceptor';
import { UserModule } from '../user/user.module';
import { MailModule } from '../email/email.module';
import { PasswordResetOtp } from './models/password-reset-otp.model';
import { EmailVerificationOtp } from './models/email-verification-otp.model';
import { DailyLoginRecord } from './models/daily-login-record.model';
import { DailyUserActivities } from './models/daily-user-activities.model';
import { DailyLoginInterceptor } from './GuardsDecorMiddleware/daily-login.interceptor';
import { SequelizeModule } from '@nestjs/sequelize';
import * as dotenv from 'dotenv';

dotenv.config();
@Global()
@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forFeature([
      PasswordResetOtp,
      EmailVerificationOtp,
      DailyLoginRecord,
      DailyUserActivities,
    ]),
    MailModule
  ],
  controllers: [AuthController, DailyLoginRecordController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    DailyLoginRecordService,
    {
      provide: APP_INTERCEPTOR,
      useClass: DailyLoginInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: DailyUserActivitiesInterceptor,
    },
    AdminGuard,
  ],
  exports: [AuthService],
})
export class AuthModule { }
