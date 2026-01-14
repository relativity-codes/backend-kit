import { Table, Column, Model, DataType, PrimaryKey, Default, IsUUID, ForeignKey, Unique, BeforeCreate } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/models/user.model';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'daily_login_records', timestamps: true })
export class DailyLoginRecord extends Model<DailyLoginRecord> {
    @ApiProperty({ description: 'Unique identifier for the daily login record', type: String, format: 'uuid' })
    @Default(() => uuidv4())
    @IsUUID(4)
    @PrimaryKey
    @Column(DataType.UUID)
    id: number;

    @ApiProperty({ description: 'ID of the user associated with this record', type: String, format: 'uuid' })
    @ForeignKey(() => User) // Assuming there is a User model defined elsewhere
    @Unique('user_loggingAt_unique_constraint')
    @Column({ type: DataType.UUID, allowNull: false })
    userId: string;

    @ApiProperty({ description: 'Date at which login was recorded (normalized to start of day)', type: String, format: 'date-time', example: '2025-09-28T00:00:00.000Z' })
    @Default(() => new Date().setHours(0, 0, 0, 0))
    @Unique('user_loggingAt_unique_constraint')
    @Column({ type: DataType.DATE, allowNull: false })
    loggingAt: Date;
}