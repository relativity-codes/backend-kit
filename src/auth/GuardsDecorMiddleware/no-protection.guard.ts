import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class NoGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext): boolean {
    return true;
  }
}
