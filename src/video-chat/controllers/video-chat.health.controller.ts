import { Controller, Get, HttpCode } from '@nestjs/common';
import { VideoChatHealthService } from '../services/video-chat.health.service';

@Controller('video-chat')
export class VideoChatHealthController {
  constructor(private readonly health: VideoChatHealthService) {}

  @Get('health')
  @HttpCode(200)
  async healthCheck() {
    const result = await this.health.healthCheck();
    return result;
  }

  @Get('ready')
  @HttpCode(200)
  async ready() {
    const result = await this.health.healthCheck();
    if (result.status === 'ok') return { status: 'ok' };
    return { status: 'fail', checks: result.checks };
  }
}
