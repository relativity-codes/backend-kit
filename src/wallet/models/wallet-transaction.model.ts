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
import { TransactionTypeEnum } from '../../shared-types/TransactionTypeEnum';
import { TransactionStatusEnum } from '../../shared-types/TransactionStatusEnum';

@Table({
  tableName: 'wallet_transactions',
  timestamps: true,
})
export class WalletTransaction extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @Column({ type: DataType.UUID, allowNull: false })
  walletId: string;

  @ApiProperty()
  @Column({ type: DataType.DECIMAL(19, 4), allowNull: false })
  amount: string;

  @ApiProperty({ enum: TransactionTypeEnum })
  @Column(DataType.ENUM(TransactionTypeEnum.DEBIT, TransactionTypeEnum.CREDIT, TransactionTypeEnum.TRANSFER, TransactionTypeEnum.REFUND))
  type: TransactionTypeEnum;

  @ApiProperty({ enum: TransactionStatusEnum })
  @Default(TransactionStatusEnum.PENDING)
  @Column(DataType.ENUM(TransactionStatusEnum.PENDING, TransactionStatusEnum.SUCCESS, TransactionStatusEnum.FAILED))
  status: TransactionStatusEnum;

  @ApiProperty()
  @Column({ type: DataType.STRING(100), allowNull: true })
  referenceId: string | null;

  @ApiProperty()
  @Column({ type: DataType.TEXT, allowNull: true })
  description: string | null;

  @ApiProperty({ type: Date })
  @Column({ type: DataType.DATE, allowNull: true })
  createdAt: CreationOptional<Date>;
}
