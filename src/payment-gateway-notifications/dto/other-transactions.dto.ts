import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class FindTransactionDto {
  @ApiProperty({ description: 'Unique identifier of the Transactions' })
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class FindByQueryDto {
  @ApiProperty({ description: 'Query to search for Transactions' })
  @IsNotEmpty()
  @IsString()
  searchQuery: string;
}
