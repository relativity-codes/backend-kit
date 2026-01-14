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
  tableName: 'register_transfer_recipient_paystacks',
  timestamps: true, // Enables automatic createdAt and updatedAt management
})
export class PaystackTransferRecipients extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  paystackId: number;

  @ApiProperty()
  @Column({ type: DataType.UUID, allowNull: false })
  bankDetailId: number;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  paystackName: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  paystackDomain: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  paystackCurrency: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: true })
  paystackIntegration: string | null;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: true })
  paystackType: string | null;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  paystackRecipientCode: string;

  @ApiProperty()
  @Column({ type: DataType.TEXT, allowNull: true })
  paystackDetail: string | null;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: true })
  paystackIsDeleted: string | null;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: true })
  paystackIsActive: string | null;

  @ApiProperty()
  @Column({ type: DataType.DATE, allowNull: true })
  paystackCreatedAt: Date | null;

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
