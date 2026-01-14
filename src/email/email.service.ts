/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import stringify from 'safe-stable-stringify';

@Injectable()
export class MailService {
  async sendEmail(arg0: {
    to: any;
    subject: string;
    text: string;
    html: string;
  }) {
    await this.mailerService
      .sendMail({
        to: arg0.to,
        subject: arg0.subject,
        text: arg0.text,
        html: arg0.html,
      })
      .catch((error) =>
        console.log(
          stringify({
            message: error.message,
            stack: error.stack,
            details: error.response || error,
          }),
        ),
      );

    Logger.log(`Email sent successfully to: ${arg0.to}`);
  }

  constructor(private mailerService: MailerService) {}
  async sendEmailVerificationOtp(arg0: { userEmail: string; otp: string }) {
    //implement this method to send the OTP via email
    // console.log('Sending email verification OTP to:', arg0.userEmail, 'OTP:', arg0.otp);
    await this.mailerService
      .sendMail({
        to: arg0.userEmail,
        subject: 'Email Verification OTP',
        template: 'email-verification-otp',
        context: {
          otp: arg0.otp,
        },
      })
      .catch((error) =>
        console.log(
          stringify({
            message: error.message,
            stack: error.stack,
            details: error.response || error,
          }),
        ),
      );

    Logger.log(
      `Email Verification OTP sent successfully to: ${arg0.userEmail}`,
    );
  }
  async sendPasswordResetOtp(arg0: { userEmail: string; otp: string }) {
    console.log(
      'Sending password reset OTP to:',
      arg0.userEmail,
      'OTP:',
      arg0.otp,
    );
    await this.mailerService
      .sendMail({
        to: arg0.userEmail,
        subject: 'Password Reset OTP',
        template: 'password-reset-otp',
        context: {
          otp: arg0.otp,
        },
      })
      .catch((error) =>
        console.log(
          stringify({
            message: error.message,
            stack: error.stack,
            details: error.response || error,
          }),
        ),
      );

    Logger.log(`Password Reset OTP sent successfully to: ${arg0.userEmail}`);
  }

  async sendVerificationEmail(metadata: { userEmail: string; link: string }) {
    await this.mailerService
      .sendMail({
        to: metadata.userEmail,
        subject: 'Nexoristech.com Account Creation Notification',
        template: 'verify-email', // `.ejs` extension is appended automatically
        context: {
          verificationUrl: metadata.link,
        },
      })
      .catch((error) =>
        console.log(
          stringify({
            message: error.message,
            stack: error.stack,
            details: error.response || error,
          }),
        ),
      );

    Logger.log(
      `Verification Email sent successfully to: ${metadata.userEmail}`,
    );
  }

  async sendForgotPasswordEmail(metadata: {
    userEmail: string;
    userName: string;
    link: string;
  }) {
    await this.mailerService
      .sendMail({
        to: metadata.userEmail,
        subject: 'Password Reset',
        template: 'forgot-password',
        context: {
          userName: metadata.userName,
          link: metadata.link,
        },
      })
      .catch((error) =>
        console.log(
          stringify({
            message: error.message,
            stack: error.stack,
            details: error.response || error,
          }),
        ),
      );

    Logger.log(
      `Forgot Password Email sent successfully to: ${metadata.userEmail}`,
    );
  }

  async resetPasswordSuccessfulEmail(metadata: {
    userEmail: string;
    userName: string;
  }) {
    await this.mailerService
      .sendMail({
        to: metadata.userEmail,
        subject: 'Reset Complete - Let’s Get You Back on Track.',
        template: 'reset-password-success',
        context: {
          userName: metadata.userName,
        },
      })
      .catch((error) =>
        console.log(
          stringify({
            message: error.message,
            stack: error.stack,
            details: error.response || error,
          }),
        ),
      );

    Logger.log(
      `Reset Password Email sent successfully to: ${metadata.userEmail}`,
    );
  }

  async testEmail(userEmail: string) {
    await this.mailerService
      .sendMail({
        to: userEmail,
        subject: 'Test Email',
        template: 'test-email',
        context: {},
      })
      .catch((error) =>
        console.log(
          stringify({
            message: error.message,
            stack: error.stack,
            details: error.response || error,
          }),
        ),
      );

    Logger.log(`Test Email sent successfully to: ${userEmail}`);
  }
}
