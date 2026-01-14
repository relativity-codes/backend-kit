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
  tableName: 'paystack_notifications',
  timestamps: true, // Enables automatic createdAt and updatedAt management
})
export class PaystackNotifications extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @Column({ type: DataType.BIGINT, allowNull: false })
  paystackId: number;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  event: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  domain: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  status: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  reference: string;

  @ApiProperty()
  @Column({ type: DataType.INTEGER, allowNull: false })
  amount: number;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: true })
  gatewayResponse: string | null;

  @ApiProperty()
  @Column({ type: DataType.DATE, allowNull: true })
  paidAt: Date | null;

  @ApiProperty()
  @Column({ type: DataType.DATE, allowNull: true })
  paystackCreatedAt: Date | null;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: true })
  channel: string | null;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  currency: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: true })
  ipAddress: string | null;

  @ApiProperty()
  @Column({ type: DataType.JSON, allowNull: true })
  metadata: Record<string, any> | null;

  @ApiProperty()
  @Column({ type: DataType.JSON, allowNull: true })
  log: Record<string, any> | null;

  @ApiProperty()
  @Column({ type: DataType.JSON, allowNull: true })
  fees: Record<string, any> | null;

  @ApiProperty()
  @Column({ type: DataType.JSON, allowNull: true })
  customer: Record<string, any> | null;

  @ApiProperty()
  @Column({ type: DataType.JSON, allowNull: true })
  authorization: Record<string, any> | null;

  @ApiProperty()
  @Column({ type: DataType.JSON, allowNull: true })
  plan: Record<string, any> | null;

  @ApiProperty({
    type: Date,
    description: 'The date when the user was created',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  createdAt: CreationOptional<Date>;

  @ApiProperty({
    type: Date,
    description: 'The date when the user was last updated',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  updatedAt: CreationOptional<Date>;
}
