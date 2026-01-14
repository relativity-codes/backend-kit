import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { TransactionTypeEnum } from '../../shared-types/TransactionTypeEnum';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Amount to credit (positive) or debit (negative)' })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: TransactionTypeEnum })
  @IsString()
  type: TransactionTypeEnum;

  @ApiPropertyOptional({ description: 'Optional external reference id' })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({ description: 'Optional human readable description' })
  @IsOptional()
  @IsString()
  description?: string;
}
