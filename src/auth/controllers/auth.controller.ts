import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  Req,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiResponse, ApiTags, ApiParam, ApiBody, ApiOperation } from '@nestjs/swagger';
import { LoginUserDto } from '../dto/login-user.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ResetPasswordValidateDto } from '../dto/reset-password-validate.dto';
import { User } from 'src/user/models/user.model';
import { NoGuard } from '../GuardsDecorMiddleware/no-protection.guard';
import { JwtAuthGuard } from '../GuardsDecorMiddleware/jwt-auth.guard';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UserId } from '../GuardsDecorMiddleware/userIdDecorator.guard';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserLoginResponse } from 'src/shared-types/UserLoginResponse';
import { UserService } from 'src/user/services/user.service';
import stringify from "safe-stable-stringify";
import { ResponseDto, UserResponseDto } from 'src/shared-types/response.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) { }

  @Post('login')
  @ApiOperation({ summary: 'Login with username/email and password' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: HttpStatus.OK, type: UserLoginResponse, description: 'Login successful' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Login failed', type: ResponseDto })
  @UseGuards(NoGuard)
  async login(@Body(new ValidationPipe()) loginUserDto: LoginUserDto): Promise<{
    status: number;
    message: string;
    data?: {
      user: User;
      token: string;
    };
    error?: any;
  }> {
    try {
      const userLogin = await this.authService.login(loginUserDto);
      return {
        status: HttpStatus.OK,
        message: 'Login successful',
        data: userLogin,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Login failed',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User registered successfully', type: UserResponseDto })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Registration failed', type: ResponseDto })
  async register(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<{ status: number; message: string; data?: User; error?: any }> {

    let existingUser: User;
    if (createUserDto.username) {

      existingUser = await this.userService.findOneByUsername(
        createUserDto.username,
      ).catch(() => null);

      if (existingUser) {
        throw new BadRequestException('Username is already taken');
      }
    }
    let existingEmail: User;

    existingEmail = await this.userService.findOneByEmail(
      createUserDto.email,
    ).catch(() => null);

    if (existingEmail) {
      throw new BadRequestException('Email is already taken');
    }

    try {
      const user = await this.authService.register(createUserDto);
      return {
        status: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: user,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Registration failed',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('verify-email/:token')
  @ApiOperation({ summary: 'Verify user email with token' })
  @ApiParam({ name: 'token', description: 'Verification token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Email verified successfully', type: ResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Invalid or expired verification token', type: ResponseDto  })
  @UseGuards(NoGuard)
  async verifyEmail(
    @Param('token') token: string,
  ): Promise<{ status: number; message: string; data?: any; error?: any }> {
    try {
      await this.authService.verifyEmail(token);
      return {
        status: HttpStatus.OK,
        message: 'Email verified successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'Invalid or expired verification token',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password reset email sent successfully', type: ResponseDto })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error sending password reset email', type: ResponseDto })
  @UseGuards(NoGuard)
  async requestPasswordReset(
    @Body(new ValidationPipe()) body: ResetPasswordDto,
  ): Promise<{ status: number; message: string; data?: any; error?: any }> {
    try {
      await this.authService.requestPasswordReset(body.email);
      return {
        status: HttpStatus.OK,
        message: 'Password reset email sent successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error sending password reset email',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change password for logged-in user' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password changed successfully', type: ResponseDto })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Error changing password', type: ResponseDto })
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @UserId() userId: string,
    @Body(new ValidationPipe()) body: ChangePasswordDto,
  ): Promise<{ status: number; message: string; data?: any; error?: any }> {
    try {
      await this.authService.changePassword(
        userId,
        body.oldPassword,
        body.newPassword,
      );
      return {
        status: HttpStatus.OK,
        message: 'Password changed successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error changing password',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('reset-password/:token')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiParam({ name: 'token', description: 'Reset password token' })
  @ApiBody({ type: ResetPasswordValidateDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Password reset successfully', type: ResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Invalid or expired reset password token', type: ResponseDto })
  @UseGuards(NoGuard)
  async resetPassword(
    @Param('token') token: string,
    @Body(new ValidationPipe()) body: ResetPasswordValidateDto,
  ): Promise<{ status: number; message: string; data?: any; error?: any }> {
    try {
      await this.authService.resetPassword(token, body.newPassword);
      return {
        status: HttpStatus.OK,
        message: 'Password reset successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'Invalid or expired reset password token',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }


  @Post('google/token')
  @ApiOperation({ summary: 'Login with Google ID token' })
  @ApiBody({ schema: { example: { idToken: 'google_id_token' } } })
  @ApiResponse({ status: 200, description: 'Returns user + JWT token', type: UserLoginResponse })
  @ApiResponse({ status: 404, description: 'Could not login', type: ResponseDto })
  async googleLogin(@Body('idToken') idToken: string) {
    try {
      const userLogin = await this.authService.loginWithGoogle(idToken);
      return {
        status: HttpStatus.OK,
        message: 'Login successful',
        data: userLogin,
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'could not login',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('apple/token')
  @ApiOperation({ summary: 'Login with Apple ID token' })
  @ApiBody({ schema: { example: { idToken: 'apple_id_token', userName: { firstName: 'John', lastName: 'Doe' } } } })
  @ApiResponse({ status: 200, description: 'Returns user + JWT token', type: UserLoginResponse })
  @ApiResponse({ status: 404, description: 'Could not login', type: ResponseDto })
  async appleLogin(@Body('idToken') idToken: string, @Body('userName') userName?: { firstName?: string; lastName?: string },) {
    try {
      const userLogin = await this.authService.loginWithApple(idToken, userName);
      return {
        status: HttpStatus.OK,
        message: 'Login successful',
        data: userLogin,
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'could not login',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('email/verify/generate-otp')
  @ApiOperation({ summary: 'Generate OTP for email verification' })
  @ApiBody({ schema: { example: { email: 'user@example.com' } } })
  @ApiResponse({ status: 200, description: 'OTP generated successfully', type: ResponseDto })
  @ApiResponse({ status: 404, description: 'User not found', type: ResponseDto })
  async generateEmailVerificationOtp(@Body('email') email: string) {
    try {
      const otp = await this.authService.generateEmailVerificationOtp(email);
      return {
        status: HttpStatus.OK,
        message: 'OTP generated successfully',
        data: { otp },
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'User not found',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('email/verify/validate-otp')
  @ApiOperation({ summary: 'Validate OTP for email verification' })
  @ApiBody({ schema: { example: { email: 'user@example.com', otp: '123456' } } })
  @ApiResponse({ status: 200, description: 'OTP validated successfully', type: ResponseDto })
  @ApiResponse({ status: 404, description: 'User not found', type: ResponseDto })
  async validateEmailVerificationOtp(@Body('email') email: string, @Body('otp') otp: string) {
    try {
      await this.authService.verifyEmailOtp(email, otp);
      return {
        status: HttpStatus.OK,
        message: 'OTP validated successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'User not found',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('password/reset/generate-otp')
  @ApiOperation({ summary: 'Generate OTP for password reset' })
  @ApiBody({ schema: { example: { email: 'user@example.com' } } })
  @ApiResponse({ status: 200, description: 'OTP generated successfully', type: ResponseDto })
  @ApiResponse({ status: 404, description: 'User not found', type: ResponseDto })
  async generatePasswordResetOtp(@Body('email') email: string) {
    try {
      const otp = await this.authService.generatePasswordResetOtp(email);
      return {
        status: HttpStatus.OK,
        message: 'OTP generated successfully',
        data: { otp },
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'User not found',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('password/reset/validate-otp')
  @ApiOperation({ summary: 'Validate OTP for password reset' })
  @ApiBody({ schema: { example: { email: 'user@example.com', otp: '123456', newPassword: 'newPassword123' } } })
  @ApiResponse({ status: 200, description: 'OTP validated successfully', type: ResponseDto })
  @ApiResponse({ status: 404, description: 'User not found', type: ResponseDto })
  async validatePasswordResetOtp(@Body('email') email: string, @Body('otp') otp: string, @Body('newPassword') newPassword: string) {
    try {
      await this.authService.resetPasswordWithOtp(email, otp, newPassword);
      return {
        status: HttpStatus.OK,
        message: 'OTP validated successfully',
      };
    } catch (error) {
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'User not found',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
