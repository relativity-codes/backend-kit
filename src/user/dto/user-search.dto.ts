import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
  IsUUID,
} from 'class-validator';
import { RoleEnum } from '../../shared-types/RoleEnum';
import { UserStatusEnum } from '../../shared-types/UserStatusEnum';

export class UserSearchDto {
  @ApiPropertyOptional({ description: 'Search by username' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Search by full name' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  guardianEmail?: string;

  @ApiPropertyOptional({ description: 'Search by email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Search by referral code' })
  @IsOptional()
  @IsString()
  referral?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  cityId: string;

  @ApiPropertyOptional({ description: 'Filter by email verification status' })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({ enum: RoleEnum, description: 'Filter by user role' })
  @IsOptional()
  @IsString()
  role?: RoleEnum;

  @ApiPropertyOptional({
    enum: UserStatusEnum,
    description: 'Filter by user status',
  })
  @IsOptional()
  @IsString()
  status?: UserStatusEnum;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  limit: number = 10;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset: number = 0;
}
