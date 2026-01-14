import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  DataType,
  Default,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Exclude } from 'class-transformer';
import { RoleEnum } from '../../shared-types/RoleEnum';
import { UserStatusEnum } from '../../shared-types/UserStatusEnum';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  username!: string;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  fullName: string;

  @Exclude()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @ApiProperty()
  @Default(false)
  @Column(DataType.BOOLEAN)
  isEmailVerified: boolean;

  @ApiProperty()
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @ApiProperty({ default: RoleEnum.USER })
  @Default(RoleEnum.USER)
  @Column(DataType.ENUM(RoleEnum.SUPER_ADMIN, RoleEnum.ADMIN, RoleEnum.USER))
  role!: RoleEnum;

  @ApiProperty({ default: UserStatusEnum.ACTIVE })
  @Default(UserStatusEnum.ACTIVE)
  @Column(
    DataType.ENUM(
      UserStatusEnum.ACTIVE,
      UserStatusEnum.INACTIVE,
      UserStatusEnum.SUSPENDED,
    ),
  )
  status!: UserStatusEnum;

  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  provider: string;

  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  providerId: string;

  @ApiPropertyOptional()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatar: string;

  @ApiPropertyOptional()
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLoginAt: Date;
}
