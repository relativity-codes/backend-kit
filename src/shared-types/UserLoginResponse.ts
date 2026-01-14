import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/models/user.model';

export class UserLoginResponse {
  @ApiProperty()
  user: User;

  @ApiProperty()
  token: string;
}
