import { PaystackNotificationsController } from './controller/paystack-notification.controller';
import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaystackNotifications } from './models/paystack-notification.model';
import { PaystackNotificationService } from './services/paystack-notification.service';
import { UserModule } from '../user/user.module';
import { MailModule } from '../email/email.module';
import { PaystackTransferRecipients } from './models/paystack-transfer-recipients';
import { PaystackTransferRecipientService } from './services/paystack-transfer-recipients.service';
import { JwtModule } from '@nestjs/jwt';
import { WalletModule } from '../wallet/wallet.module';
import { MonnifyNotifications } from './models/monnify-notification.model';
import { MonnifyNotificationService } from './services/monnify-notification.service';
import { MonnifyNotificationsController } from './controller/monnify-notification.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PaystackNotifications,
      PaystackTransferRecipients,
      // Monnify notifications model
      MonnifyNotifications,
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => MailModule),
    forwardRef(() => WalletModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '30d' },
    }),
  ],
  providers: [PaystackNotificationService, PaystackTransferRecipientService, MonnifyNotificationService],
  controllers: [PaystackNotificationsController, MonnifyNotificationsController],
  exports: [PaystackNotificationService, PaystackTransferRecipientService, MonnifyNotificationService],
})
export class PaymentGatewayNotificationsModule {}
