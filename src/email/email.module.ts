import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
// import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './email.service';
import * as dotenv from 'dotenv';
import { JwtModule } from '@nestjs/jwt';
dotenv.config();
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          host: process.env.EMAIL_HOST ?? config.get('EMAIL_HOST'),
          port: Number(process.env.EMAIL_PORT ?? config.get('EMAIL_PORT')),
          secure:
            (process.env.EMAIL_SECURE ?? config.get('EMAIL_SECURE')) === 'true',
          auth: {
            user: process.env.EMAIL_USER ?? config.get('EMAIL_USER'),
            pass: process.env.EMAIL_PASSWORD ?? config.get('EMAIL_PASSWORD'),
          },
        },
        family: 4,
        defaults: {
          from: `"${process.env.APP_NAME ?? config.get('APP_NAME')}" <${process.env.EMAIL_USER ?? config.get('EMAIL_USER')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
