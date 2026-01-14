import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DailyUserActivities } from '../models/daily-user-activities.model';
import { Op } from 'sequelize';

@Injectable()
export class DailyUserActivitiesService {
  constructor(
    @InjectModel(DailyUserActivities)
    private readonly activitiesModel: typeof DailyUserActivities,
  ) {}

  async findAll(
    offset = 0,
    limit = 100,
    startDate?: string,
    endDate?: string,
  ): Promise<{ data: DailyUserActivities[]; count: number }> {
    const where: any = {};
    if (startDate && endDate) {
      where.activityDay = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    } else if (startDate) {
      where.activityDay = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.activityDay = { [Op.lte]: new Date(endDate) };
    }
    const { rows, count } = await this.activitiesModel.findAndCountAll({ where, offset, limit });
    return { data: rows, count };
  }

  async findByUser(
    userId: string,
    offset = 0,
    limit = 100,
    startDate?: string,
    endDate?: string,
  ): Promise<{ data: DailyUserActivities[]; count: number }> {
    const where: any = { userId };
    if (startDate && endDate) {
      where.activityDay = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    } else if (startDate) {
      where.activityDay = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.activityDay = { [Op.lte]: new Date(endDate) };
    }
    const { rows, count } = await this.activitiesModel.findAndCountAll({ where, offset, limit });
    return { data: rows, count };
  }
}