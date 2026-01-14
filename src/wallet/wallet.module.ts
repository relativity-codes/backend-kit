import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Wallet } from './models/wallet.model';
import { WalletTransaction } from './models/wallet-transaction.model';
import { WalletService } from './services/wallet.service';
import { WalletController } from './controllers/wallet.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET_KEY,
            signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
        }),
        SequelizeModule.forFeature([Wallet, WalletTransaction])],
    providers: [WalletService],
    controllers: [WalletController],
    exports: [WalletService],
})
export class WalletModule { }
