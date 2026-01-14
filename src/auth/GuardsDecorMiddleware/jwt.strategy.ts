import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../services/auth.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY || 'default-secret-key',
    });
  }

  async validate(payload: any): Promise<any> {
    // Check if the token has expired
    if (payload.exp < Date.now() / 1000) {
      throw new UnauthorizedException('Token has expired');
    }

    // Validate the user by username (or other identifier)
    const user = await this.authService.validateUserByUsernameMiddleware(
      payload.username,
    );

    if (!user) {
      throw new UnauthorizedException(
        'User not found: Please pass the bearer token',
      );
    }

    // The user is returned here and automatically attached to the request object as `request.user`
    return user;
  }
}
