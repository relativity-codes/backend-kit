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
  tableName: 'monnify_notifications',
  timestamps: true,
})
export class MonnifyNotifications extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  eventType: string;

  @ApiProperty()
  @Column({ type: DataType.JSON, allowNull: false })
  eventData: Record<string, any>;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: true })
  transactionReference: string | null;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: true })
  paymentReference: string | null;

  @ApiProperty()
  @Column({ type: DataType.DECIMAL(19, 4), allowNull: true })
  amountPaid: string | null;

  @ApiProperty()
  @Column({ type: DataType.STRING(10), allowNull: true })
  currency: string | null;

  @ApiProperty({ type: Date })
  @Column({ type: DataType.DATE, allowNull: true })
  paidOn: Date | null;

  @ApiProperty({ type: Date })
  @Column({ type: DataType.DATE, allowNull: true })
  createdAt: CreationOptional<Date>;

  @ApiProperty({ type: Date })
  @Column({ type: DataType.DATE, allowNull: true })
  updatedAt: CreationOptional<Date>;
}
