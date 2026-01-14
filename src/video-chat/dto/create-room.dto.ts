import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ description: 'Optional human friendly room name' })
  @IsOptional()
  @IsString()
  name?: string;
}
