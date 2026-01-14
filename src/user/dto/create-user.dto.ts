import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { RoleEnum } from 'src/shared-types/RoleEnum';

export class CreateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    example: 'P@ssw0rd',
    description: 'Password of the user',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email of the user',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEmailVerified: boolean;

  @ApiPropertyOptional({
    example: RoleEnum.USER,
    enum: RoleEnum,
    description: 'Role of the user',
  })
  @IsOptional()
  @IsString()
  role?: RoleEnum = RoleEnum.USER;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatar?: string;
}
