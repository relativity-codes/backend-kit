import { ApiProperty } from '@nestjs/swagger';
import { CreationOptional } from 'sequelize';
import { Column, DataType, Default, IsUUID, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'rooms', timestamps: true })
export class Room extends Model {
  @ApiProperty()
  @Default(() => uuidv4())
  @IsUUID(4)
  @PrimaryKey
  @Column(DataType.UUID)
  id: string;

  @ApiProperty()
  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @ApiProperty()
  @Column({ type: DataType.UUID, allowNull: false })
  hostUserId: string;

  @ApiProperty()
  @Default(true)
  @Column({ type: DataType.BOOLEAN })
  isActive: boolean;

  @ApiProperty({ type: Date })
  @Column({ type: DataType.DATE, allowNull: true })
  createdAt: CreationOptional<Date>;

  @ApiProperty({ type: Date })
  @Column({ type: DataType.DATE, allowNull: true })
  updatedAt: CreationOptional<Date>;
}
