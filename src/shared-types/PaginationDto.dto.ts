import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  offset?: number = 0;
}
