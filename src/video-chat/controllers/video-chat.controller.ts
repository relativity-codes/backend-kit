import { Controller, Post, Body, UseGuards, HttpStatus, Get, Param, HttpException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/GuardsDecorMiddleware/jwt-auth.guard';
import { UserId } from '../../auth/GuardsDecorMiddleware/userIdDecorator.guard';
import { VideoChatService } from '../services/video-chat.service';
import { CreateRoomDto } from '../dto/create-room.dto';
import { JoinRoomDto } from '../dto/join-room.dto';
import stringify from 'safe-stable-stringify';

@ApiTags('VideoChat')
@Controller('video-chat')
export class VideoChatController {
    constructor(private readonly videoChatService: VideoChatService) { }

    @Post('rooms')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a room' })
    @ApiBody({ type: CreateRoomDto })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Room created successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    async createRoom(@UserId() userId: string, @Body() dto: CreateRoomDto) {
        try {
            const room = await this.videoChatService.createRoom(userId, dto.name);
            return { status: HttpStatus.CREATED, message: 'Room created', data: room };
        } catch (error) {
            throw new BadRequestException({
                message: 'Error ',
                details: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            });
        }

    }

    @Get('rooms')
    @ApiOperation({ summary: 'List active rooms' })
    @ApiResponse({ status: HttpStatus.OK, description: 'List of active rooms' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    async listRooms() {
        try {
            const rooms = await this.videoChatService.listRooms();
            return { status: HttpStatus.OK, message: 'Rooms retrieved', data: rooms };
        } catch (error) {
            throw new BadRequestException({
                message: 'Error ',
                details: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            });
        }
    }

    @Post('rooms/:id/join')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Join a room' })
    @ApiParam({ name: 'id', description: 'Room ID' })
    @ApiBody({ type: JoinRoomDto })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully joined room' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized to join' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Room not found' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    async joinRoom(@Param('id') id: string, @UserId() userId: string, @Body() dto: JoinRoomDto) {
        try {
            const participant = await this.videoChatService.joinRoom(id, userId, dto.role);
            return { status: HttpStatus.OK, message: 'Joined room', data: participant };
        } catch (error) {
            throw new BadRequestException({
                message: 'Error ',
                details: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            });
        }
    }

    @Post('rooms/:id/leave')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Leave a room' })
    @ApiParam({ name: 'id', description: 'Room ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Left room successfully' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized to leave' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Room or participant not found' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    async leaveRoom(@Param('id') id: string, @UserId() userId: string) {
        try {
            await this.videoChatService.leaveRoom(id, userId);
            return { status: HttpStatus.OK, message: 'Left room' };
        } catch (error) {
            throw new BadRequestException({
                message: 'Error ',
                details: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            });
        }
    }

    @Get('rooms/:id/participants')
    @ApiOperation({ summary: 'List participants of a room' })
    @ApiParam({ name: 'id', description: 'Room ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'List of participants' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    async listParticipants(@Param('id') id: string) {
        try {
            const participants = await this.videoChatService.listParticipants(id);
            return { status: HttpStatus.OK, message: 'Participants retrieved', data: participants };
        } catch (error) {
            throw new BadRequestException({
                message: 'Error ',
                details: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            });
        }
    }

    @Post('rooms/:id/token')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create an ephemeral token for the room (returns token, TTL and ICE servers)' })
    @ApiParam({ name: 'id', description: 'Room ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Token and ICE server configuration' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized to get token for this room' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Room not found' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    async createToken(@Param('id') id: string, @UserId() userId: string) {
        try {
            const token = await this.videoChatService.createToken(id, userId);
            return { status: HttpStatus.OK, message: 'Token generated', data: token };
        } catch (error) {
            throw new BadRequestException({
                message: 'Error ',
                details: stringify({
                    message: error.message,
                    stack: error.stack,
                    details: error.response || error,
                }),
            });
        }
    }
}
