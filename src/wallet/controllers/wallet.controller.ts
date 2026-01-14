import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from '../../auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { WalletService } from '../services/wallet.service';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { ResponseDto } from 'src/shared-types/response.dto';
import stringify from 'safe-stable-stringify';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('')
  @ApiOperation({ summary: "Get the caller's wallet" })
  @ApiResponse({ status: HttpStatus.OK, description: 'Wallet retrieved successfully', type: ResponseDto })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: ResponseDto })
  @UseGuards(JwtAuthGuard)
  async getWallet(@UserId() userId: string) {
    try {
      const wallet = await this.walletService.findOrCreateForUser(userId);
      return {
        status: HttpStatus.OK,
        message: 'Wallet retrieved successfully',
        data: wallet,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: stringify({ message: error.message, stack: error.stack, details: error.response || error }),
      };
    }
  }

  @Post('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a wallet transaction (credit/debit)' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Transaction processed', type: ResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request body', type: ResponseDto })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: ResponseDto })
  async createTransaction(@UserId() userId: string, @Body(new ValidationPipe()) dto: CreateTransactionDto) {
    try {
      const txn = await this.walletService.createTransactionPending(userId, dto);
      return {
        status: HttpStatus.OK,
        message: 'Transaction processed',
        data: txn,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: stringify({ message: error.message, stack: error.stack, details: error.response || error }),
      };
    }
  }
}
