import { Table, Column, Model, DataType, PrimaryKey, Default, IsUUID, ForeignKey, Unique, BeforeCreate } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/models/user.model';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'daily_user_activities', timestamps: true })
export class DailyUserActivities extends Model<DailyUserActivities> {
    @ApiProperty({ description: 'Unique identifier for the daily user activities record', type: String, format: 'uuid' })
    @Default(() => uuidv4())
    @IsUUID(4)
    @PrimaryKey
    @Column(DataType.UUID)
    id: number;

    @ApiProperty({ description: 'ID of the user associated with this record', type: String, format: 'uuid' })
    @ForeignKey(() => User)
    @Column({ type: DataType.UUID, allowNull: false })
    userId: string;

    @ApiProperty({ description: 'Date at which login was recorded (normalized to start of day)', type: String, format: 'date-time', example: '2025-09-28T00:00:00.000Z' })
    @Default(() => new Date().setHours(0, 0, 0, 0))
    @Column({ type: DataType.DATE, allowNull: false })
    activityDay: Date;

    @Default(() => new Date())
    @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
    fullTimestamp: Date;

    @Column({ type: DataType.TEXT, allowNull: true })
    routeVisited: string;

    @Column({ type: DataType.TEXT, allowNull: true })
    actionPerformed: string;

    @Column({ type: DataType.STRING, allowNull: true })
    modulueName: string;

    @Column({ type: DataType.STRING, allowNull: true })
    ipAddress: string;

    @Column({ type: DataType.STRING, allowNull: true })
    modelClassName: string;

    @Column({ type: DataType.STRING, allowNull: true })
    methodName: string;
}