import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Amount to credit (positive) or debit (negative)' })
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: ['DEBIT', 'CREDIT', 'TRANSFER', 'REFUND'] })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Optional external reference id' })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({ description: 'Optional human readable description' })
  @IsOptional()
  @IsString()
  description?: string;
}
