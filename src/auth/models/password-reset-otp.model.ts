import { Table, Column, Model, DataType, PrimaryKey, IsUUID, Default } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'password_reset_otps', timestamps: true })
export class PasswordResetOtp extends Model<PasswordResetOtp> {
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
    used: boolean;
}