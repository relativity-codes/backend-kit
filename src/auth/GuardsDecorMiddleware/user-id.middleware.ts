import { Injectable, ExecutionContext, CallHandler, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

// user-id.middleware.ts
@Injectable()
export class UserIdMiddleware implements NestMiddleware {
  constructor(private jwt: JwtService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try { req['userId'] = this.jwt.verify(token).sub } catch {}
    }
    next();
  }
}