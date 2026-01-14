/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { PaystackNotifications } from '../models/paystack-notification.model';
import { PaystackNotificationService } from '../services/paystack-notification.service';
import { JwtAuthGuard } from 'src/auth/GuardsDecorMiddleware/jwt-auth.guard';

@ApiTags('Paystack Notifications')
@Controller('paystack-notifications')
export class PaystackNotificationsController {
  constructor(
    private readonly paystackNotificationsService: PaystackNotificationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Save a new Paystack notification' })
  @ApiBody({ type: Object }) // Adjust the type as needed
  @ApiResponse({ status: 201, description: 'Notification saved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async saveNotification(
    @Body() data: any,
    @Request() req: Request,
  ): Promise<{
    status: number;
    message: string;
    data?: PaystackNotifications;
    error?: any;
  }> {
    try {
      console.log('Received Paystack notification 1:', data);
      console.log('Received Paystack notification Req:', req);
      // 1. IP Whitelisting
      // const allowedIPs = ['52.31.139.75', '52.49.173.169', '52.214.14.220', '52.214.14.220', '162.158.6.145'];
      // if (
      //   !allowedIPs.includes(
      //     (req as any).ip ||
      //       (req as any).headers['x-forwarded-for'] ||
      //       (req as any).socket.remoteAddress,
      //   )
      // ) {
      //   throw new HttpException(
      //     'Unauthorized: Invalid IP address',
      //     HttpStatus.UNAUTHORIZED,
      //   );
      // }

      // 2. Signature Verification
      // const secret = process.env.PAYSTACK_SECRET_KEY || ''; // Replace with your actual Paystack secret key
      // const hash = crypto
      //   .createHmac('sha512', secret)
      //   .update(JSON.stringify(req.body))
      //   .digest('hex');
      // if (hash !== req.headers['x-paystack-signature']) {
      //   throw new HttpException(
      //     'Unauthorized: Invalid signature',
      //     HttpStatus.UNAUTHORIZED,
      //   );
      // }
      console.log('Received Paystack notification 2:', data);
      const notification =
        await this.paystackNotificationsService.savePaystackNotification(data);
      return {
        status: 201,
        message: 'Notification saved successfully',
        data: notification,
      };
    } catch (error) {
      return {
        status: 400,
        message: 'Failed to save notification',
        error: JSON.stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a Paystack notification by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the notification' })
  @ApiResponse({ status: 200, description: 'Notification found' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string): Promise<{
    status: number;
    message: string;
    data?: PaystackNotifications | null;
    error?: any;
  }> {
    try {
      const notification = await this.paystackNotificationsService.findById(id);
      if (notification) {
        return {
          status: 200,
          message: 'Notification found',
          data: notification,
        };
      } else {
        return {
          status: 404,
          message: 'Notification not found',
        };
      }
    } catch (error) {
      return {
        status: 500,
        message: 'Internal Server Error',
        error: JSON.stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Find all Paystack notifications' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  // @UseGuards(JwtAuthGuard)
  async findAll(
    // @UserId() userId: string,
    @Query() options?: { limit?: number; offset?: number },
  ): Promise<{
    status: number;
    message: string;
    data?: PaystackNotifications[];
    error?: any;
  }> {
    try {
      // const userIdString = userId.toString();
      // console.log('User ID:', userIdString);
      const notifications =
        await this.paystackNotificationsService.findAll(options);
      return {
        status: 200,
        message: 'Notifications retrieved successfully',
        data: notifications,
      };
    } catch (error) {
      return {
        status: 500,
        message: 'Internal Server Error',
        error: JSON.stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for Paystack notifications' })
  @ApiQuery({ name: 'reference', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'amount', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Notifications found' })
  @ApiResponse({ status: 404, description: 'No notifications found' })
  @UseGuards(JwtAuthGuard)
  async search(
    @Query()
    searchOptions: {
      reference?: string;
      status?: string;
      amount?: number;
    },
  ): Promise<{
    status: number;
    message: string;
    data?: PaystackNotifications[];
    error?: any;
  }> {
    try {
      const notifications =
        await this.paystackNotificationsService.search(searchOptions);
      if (notifications.length > 0) {
        return {
          status: 200,
          message: 'Notifications found',
          data: notifications,
        };
      } else {
        return {
          status: 404,
          message: 'No notifications found',
        };
      }
    } catch (error) {
      return {
        status: 500,
        message: 'Internal Server Error',
        error: JSON.stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
