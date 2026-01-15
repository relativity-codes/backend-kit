import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class SocketJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const token = (client.handshake?.auth && client.handshake.auth.token) || client.handshake?.query?.token;

    if (!token) {
      try {
        client.disconnect(true);
      } catch (err) {
        // ignore
      }
      return false;
    }

    try {
      const decoded = this.jwtService.verify(token);
      (client as any).data = (client as any).data || {};
      (client as any).data.user = decoded;
      return true;
    } catch (err) {
      try {
        client.disconnect(true);
      } catch (e) {
        // ignore
      }
      return false;
    }
  }
}
