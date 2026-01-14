import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class JoinRoomDto {
  @ApiProperty({ description: 'Optional role: HOST or PEER' })
  @IsOptional()
  @IsString()
  role?: string;
}
