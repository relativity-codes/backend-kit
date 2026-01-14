import { ApiProperty } from '@nestjs/swagger';
import { CreationOptional } from 'sequelize';
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

@Table({
  tableName: 'wallets',
  timestamps: true,
})
export class Wallet extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @Column({ type: DataType.UUID, allowNull: false, unique: true })
  userId: string;

  @ApiProperty()
  @Default('0.0000')
  @Column({ type: DataType.DECIMAL(19, 4), allowNull: false })
  balance: string;

  @ApiProperty()
  @Default('USD')
  @Column({ type: DataType.STRING(3), allowNull: false })
  currency: string;

  @ApiProperty()
  @Default(0)
  @Column({ type: DataType.BIGINT, allowNull: false })
  version: number;

  @ApiProperty({ type: Date })
  @Column({ type: DataType.DATE, allowNull: true })
  createdAt: CreationOptional<Date>;

  @ApiProperty({ type: Date })
  @Column({ type: DataType.DATE, allowNull: true })
  updatedAt: CreationOptional<Date>;
}
