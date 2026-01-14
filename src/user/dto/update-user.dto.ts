import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { RoleEnum } from 'src/shared-types/RoleEnum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEmailVerified: boolean;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'Password of the user',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email of the user',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: RoleEnum.USER,
    enum: RoleEnum,
    description: 'Role of the user',
  })
  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  role?: RoleEnum = RoleEnum.USER;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
