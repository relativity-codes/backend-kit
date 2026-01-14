import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DailyLoginRecord } from '../models/daily-login-record.model';
import { Op } from 'sequelize';

@Injectable()
export class DailyLoginRecordService {
  constructor(
    @InjectModel(DailyLoginRecord)
    private readonly dailyLoginRecordModel: typeof DailyLoginRecord,
  ) {}

  /**
   * Retrieve paginated daily login records
   * @param offset number of records to skip
   * @param limit maximum number of records to return
   */
  /**
   * Retrieve paginated daily login records, optionally within date range
   */
  async findAll(
    offset = 0,
    limit = 100,
    startDate?: string,
    endDate?: string,
  ): Promise<{ data: DailyLoginRecord[]; count: number }> {
    const where: any = {};
    if (startDate && endDate) {
      where.loggingAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      where.loggingAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.loggingAt = { [Op.lte]: new Date(endDate) };
    }
    const { rows, count } = await this.dailyLoginRecordModel.findAndCountAll({
      where,
      offset,
      limit,
    });
    return { data: rows, count };
  }

  /**
   * Retrieve paginated daily login records for a specific user
   * @param userId ID of the user
   * @param offset number of records to skip
   * @param limit maximum number of records to return
   */
  /**
   * Retrieve paginated daily login records for a user, optionally within date range
   */
  async findByUser(
    userId: string,
    offset = 0,
    limit = 100,
    startDate?: string,
    endDate?: string,
  ): Promise<{ data: DailyLoginRecord[]; count: number }> {
    const where: any = { userId };
    if (startDate && endDate) {
      where.loggingAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      where.loggingAt = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
      where.loggingAt = { [Op.lte]: new Date(endDate) };
    }
    const { rows, count } = await this.dailyLoginRecordModel.findAndCountAll({
      where,
      offset,
      limit,
    });
    return { data: rows, count };
  }
}