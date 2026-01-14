import { ApiProperty } from '@nestjs/swagger';
import { CreationOptional } from 'sequelize';
import { Column, DataType, Default, IsUUID, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'room_participants', timestamps: true })
export class RoomParticipant extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @Column({ type: DataType.UUID, allowNull: false })
  roomId: string;

  @ApiProperty()
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @ApiProperty()
  @Default('PEER')
  @Column({ type: DataType.STRING(20), allowNull: false })
  role: string; // e.g., HOST, PEER

  @ApiProperty({ type: Date })
  @Column({ type: DataType.DATE, allowNull: true })
  joinedAt: CreationOptional<Date>;
}
