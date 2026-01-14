import { Controller, Get, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam, getSchemaPath, ApiOkResponse } from '@nestjs/swagger';
import { DailyLoginRecordService } from '../services/daily-login-record.service';
import { JwtAuthGuard } from '../GuardsDecorMiddleware/jwt-auth.guard';
import { DailyLoginRecord } from '../models/daily-login-record.model';

@ApiTags('Daily Login Records')
@Controller('daily-login-records')
@UseGuards(JwtAuthGuard)
export class DailyLoginRecordController {
  constructor(private readonly dailyService: DailyLoginRecordService) {}

  @Get()
  @ApiOperation({ summary: 'Get all daily login records (paginated)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of records to skip', example: 0 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of records to return', example: 100 })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (inclusive) filter, ISO string', example: '2025-09-01T00:00:00.000Z' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (inclusive) filter, ISO string', example: '2025-09-28T23:59:59.999Z' })
  @ApiOkResponse({
    description: 'Paginated daily login records',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(DailyLoginRecord) } },
        count: { type: 'number' },
      },
    },
  })
  getAll(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ data: DailyLoginRecord[]; count: number }> {
    return this.dailyService.findAll(offset, limit, startDate, endDate);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get daily login records for a specific user (paginated)' })
  @ApiParam({ name: 'userId', required: true, description: 'User UUID to fetch records for', type: String, example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of records to skip', example: 0 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of records to return', example: 100 })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (inclusive) filter, ISO string', example: '2025-09-01T00:00:00.000Z' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (inclusive) filter, ISO string', example: '2025-09-28T23:59:59.999Z' })
  @ApiOkResponse({
    description: 'Paginated daily login records for the user',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(DailyLoginRecord) } },
        count: { type: 'number' },
      },
    },
  })
  getByUser(
    @Param('userId') userId: string,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ data: DailyLoginRecord[]; count: number }> {
    return this.dailyService.findByUser(userId, offset, limit, startDate, endDate);
  }
}