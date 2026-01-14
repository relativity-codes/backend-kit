import {
  Controller,
  Get,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
  ValidationPipe,
  HttpStatus,
  Query,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { User } from '../models/user.model';
import { JwtAuthGuard } from '../../auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import {
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import {
  ResponseDto,
  UserArrayResponseDto,
  UserResponseDto,
} from 'src/shared-types/response.dto';
import { UserSearchDto } from '../dto/user-search.dto';
import { UserId } from 'src/auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import stringify from "safe-stable-stringify";
// import { AdminOnly } from 'src/auth/GuardsDecorMiddleware/AdminOnlyDecorator.guard';

@ApiTags('User')
@Controller('')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get('user/all')
  @UseGuards(JwtAuthGuard)
  // @AdminOnly()
  @ApiOperation({ summary: 'Get all users with optional filters' })
  @ApiQuery({ name: 'username', required: false, type: String, description: 'Filter by username' })
  @ApiQuery({ name: 'email', required: false, type: String, description: 'Filter by email' })
  @ApiQuery({ name: 'isEmailVerified', required: false, type: Boolean, description: 'Filter by email verification status' })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by role' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Pagination offset' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of users', type: UserArrayResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No users found', type: ResponseDto })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: ResponseDto })
  async findAll(@Query() userSearchDto: UserSearchDto): Promise<{
    status: number;
    message: string;
    data?: User[];
    error?: any;
  }> {
    try {
      const users = await this.userService.findAll(userSearchDto);
      if (!users || users.length === 0) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'No users found',
          data: [],
        };
      }
      return {
        status: HttpStatus.OK,
        message:
          'Users(with corporate body or individual information) retrieved successfully',
        data: users,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User details', type: UserResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found', type: ResponseDto })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: ResponseDto })
  @UseGuards(JwtAuthGuard)
  async findOneById(
    @Param('id') id: string,
  ): Promise<{ status: number; message: string; data?: User; error?: any }> {
    try {
      const user = await this.userService.findOneById(id);
      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'User retrieved successfully',
        data: user,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Post('user')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User added successfully', type: UserResponseDto })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: ResponseDto })
  async create(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ): Promise<{ status: number; message: string; data?: User; error?: any }> {
    try {
      const user = await this.userService.create(createUserDto);
      return {
        status: HttpStatus.CREATED,
        message: 'User added successfully',
        data: user,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: stringify({
        message: error.message,
        stack: error.stack,
        details: error.response || error,
        }),
      };
    }
  }

  @Put('user/:id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found', type: ResponseDto })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: ResponseDto })
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updatedUserDto: UpdateUserDto,
    @UserId() userId: string,
  ): Promise<{ status: number; message: string; data?: User; error?: any }> {
    try {
      const updatedUser = await this.userService.update(
        id,
        updatedUserDto,
        userId,
      );
      if (!updatedUser) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'User updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }

  @Delete('user/:id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully', type: UserResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found', type: ResponseDto })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error', type: ResponseDto })
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
  ): Promise<{ status: number; message: string; data?: User; error?: any }> {
    try {
      const deletedUser = await this.userService.delete(id);
      if (!deletedUser) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'User deleted successfully',
        data: deletedUser,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: stringify({
          message: error.message,
          stack: error.stack,
          details: error.response || error,
        }),
      };
    }
  }
}
