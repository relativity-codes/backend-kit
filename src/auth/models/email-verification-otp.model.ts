import { Table, Column, Model, DataType, PrimaryKey, Default, IsUUID } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'email_verification_otps', timestamps: true })
export class EmailVerificationOtp extends Model<EmailVerificationOtp> {
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  otp: string;

  @Column({ type: DataType.DATE, allowNull: false })
  expiresAt: Date;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  verified: boolean;
}