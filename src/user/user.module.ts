import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from '../email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    SequelizeModule.forFeature([
      User,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => MailModule),
    forwardRef(() => WalletModule),
  ],
  providers: [
    UserService,
  ],
  controllers: [
    UserController,
  ],
  exports: [
    UserService,
  ],
})
export class UserModule { }
