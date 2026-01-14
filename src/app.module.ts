/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config';
import { Sequelize } from 'sequelize-typescript';
import { User } from './user/models/user.model';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MailModule } from './email/email.module';
import { PasswordResetOtp } from './auth/models/password-reset-otp.model';
import { EmailVerificationOtp } from './auth/models/email-verification-otp.model';
import { DailyUserActivities } from './auth/models/daily-user-activities.model';
import { DailyLoginRecord } from './auth/models/daily-login-record.model';
import { JwtModule } from '@nestjs/jwt';
import { PaystackNotifications } from './payment-gateway-notifications/models/paystack-notification.model';
import { PaystackTransferRecipients } from './payment-gateway-notifications/models/paystack-transfer-recipients';
import { MonnifyNotifications } from './payment-gateway-notifications/models/monnify-notification.model';
import { Room } from './video-chat/models/room.model';
import { RoomParticipant } from './video-chat/models/room-participant.model';
import { VideoChatModule } from './video-chat/video-chat.module';
import { PaymentGatewayNotificationsModule } from './payment-gateway-notifications/payment-gateway-notifications.module';
import { WalletModule } from './wallet/wallet.module';

console.log('R E L A T I V I T Y - C O D E S');

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forRoot({
      ...config,
      models: [
        User,
        PasswordResetOtp,
        EmailVerificationOtp,
        DailyLoginRecord,
        DailyUserActivities,
        PaystackNotifications,
        PaystackTransferRecipients,
        MonnifyNotifications,
        Room,
        RoomParticipant,
      ],
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      autoLoadModels: true,
      synchronize: true, // Please be careful as it can cause the loss of data
    }),
    AuthModule,
    UserModule,
    MailModule,
    PaymentGatewayNotificationsModule,
    WalletModule,
    VideoChatModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private sequelize: Sequelize) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async onModuleInit() {
    console.log('Module initialized successfully'); // Log associations for debugging
  }
}
