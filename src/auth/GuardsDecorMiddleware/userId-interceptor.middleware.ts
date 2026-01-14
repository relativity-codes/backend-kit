import { Injectable, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserIdInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    console.log('Extracted Token:', token)
    if (token) {
      try {
        const decoded = this.jwtService.verify(token);
        request['userId'] = decoded.sub;
      } catch (error) {
        console.error('JWT validation failed', error);
      }
    }

    return next.handle();
  }
}
