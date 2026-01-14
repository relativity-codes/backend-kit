import { Controller, Get, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { DailyUserActivitiesService } from '../services/daily-user-activities.service';
import { JwtAuthGuard } from '../GuardsDecorMiddleware/jwt-auth.guard';
import { DailyUserActivities } from '../models/daily-user-activities.model';

@ApiTags('Daily User Activities')
@Controller('daily-user-activities')
@UseGuards(JwtAuthGuard)
export class DailyUserActivitiesController {
  constructor(private readonly activitiesService: DailyUserActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user activities records (paginated)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of records to skip', example: 0 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of records to return', example: 100 })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter for activityDay', example: '2025-09-01T00:00:00.000Z' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter for activityDay', example: '2025-09-28T23:59:59.999Z' })
  @ApiOkResponse({
    description: 'Paginated user activity records',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(DailyUserActivities) } },
        count: { type: 'number' },
      },
    },
  })
  getAll(
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ data: DailyUserActivities[]; count: number }> {
    return this.activitiesService.findAll(offset, limit, startDate, endDate);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get activities for a specific user (paginated)' })
  @ApiParam({ name: 'userId', required: true, description: 'User UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of records to skip', example: 0 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of records to return', example: 100 })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter for activityDay', example: '2025-09-01T00:00:00.000Z' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter for activityDay', example: '2025-09-28T23:59:59.999Z' })
  @ApiOkResponse({
    description: 'Paginated user activity records for the user',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: getSchemaPath(DailyUserActivities) } },
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
  ): Promise<{ data: DailyUserActivities[]; count: number }> {
    return this.activitiesService.findByUser(userId, offset, limit, startDate, endDate);
  }
}
