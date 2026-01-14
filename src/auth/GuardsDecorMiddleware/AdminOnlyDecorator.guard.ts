import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';

export function AdminOnly(): MethodDecorator {
  return applyDecorators(UseGuards(JwtAuthGuard, AdminGuard));
}
