/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Body, Request, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MonnifyNotificationService } from '../services/monnify-notification.service';
import { MonnifyNotifications } from '../models/monnify-notification.model';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';

@ApiTags('Monnify Notifications')
@Controller('monnify-notifications')
export class MonnifyNotificationsController {
  constructor(private readonly monnifyService: MonnifyNotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Save a new Monnify notification' })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 201, description: 'Notification saved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async saveNotification(@Body() data: any, @Request() req: Request): Promise<{ status: number; message: string; data?: MonnifyNotifications; error?: any }> {
    try {
      console.log('Received Monnify notification:', data);
      const notification = await this.monnifyService.saveMonnifyNotification(data);
      return {
        status: 201,
        message: 'Notification saved successfully',
        data: notification,
      };
    } catch (error) {
      return {
        status: 400,
        message: 'Failed to save notification',
        error: JSON.stringify({ message: error.message, stack: error.stack, details: error.response || error }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a Monnify notification by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the notification' })
  @ApiResponse({ status: 200, description: 'Notification found' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string): Promise<{ status: number; message: string; data?: MonnifyNotifications | null; error?: any }> {
    try {
      const notification = await this.monnifyService.findById(id);
      if (notification) {
        return { status: 200, message: 'Notification found', data: notification };
      }
      return { status: 404, message: 'Notification not found' };
    } catch (error) {
      return { status: 500, message: 'Internal Server Error', error: JSON.stringify({ message: error.message, stack: error.stack, details: error.response || error }) };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Find all Monnify notifications' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(@Query() options?: { limit?: number; offset?: number }): Promise<{ status: number; message: string; data?: MonnifyNotifications[]; error?: any }> {
    try {
      const notifications = await this.monnifyService.findAll(options);
      return { status: 200, message: 'Notifications retrieved successfully', data: notifications };
    } catch (error) {
      return { status: 500, message: 'Internal Server Error', error: JSON.stringify({ message: error.message, stack: error.stack, details: error.response || error }) };
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for Monnify notifications' })
  @ApiQuery({ name: 'reference', required: false, type: String })
  @ApiQuery({ name: 'amount', required: false, type: Number })
  @UseGuards(JwtAuthGuard)
  async search(@Query() searchOptions: { reference?: string; amount?: number }): Promise<{ status: number; message: string; data?: MonnifyNotifications[]; error?: any }> {
    try {
      const notifications = await this.monnifyService.search(searchOptions);
      if (notifications.length > 0) {
        return { status: 200, message: 'Notifications found', data: notifications };
      }
      return { status: 404, message: 'No notifications found' };
    } catch (error) {
      return { status: 500, message: 'Internal Server Error', error: JSON.stringify({ message: error.message, stack: error.stack, details: error.response || error }) };
    }
  }
}
