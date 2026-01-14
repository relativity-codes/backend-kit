import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from 'src/user/models/user.model';

// response.dto.ts
export class ResponseDto<T> {
  @ApiProperty()
  status: number;

  data?: T | T[];

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional()
  message?: string;
}

export class PResponseDto<T> {
  @ApiProperty()
  count: number;

  @ApiProperty()
  rows: T[];
}

export class PaginationResponseDto<T> {
  @ApiProperty()
  status: number;

  data?: PResponseDto<T>;

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional()
  message?: string;
}

export class UserResponseDto extends ResponseDto<User> {
  // @ApiProperty({ type: () => User })
  data?: User;
}

export class UserArrayResponseDto extends ResponseDto<User> {
  // @ApiProperty({ type: () => User, isArray: true })
  data?: any[];
}
