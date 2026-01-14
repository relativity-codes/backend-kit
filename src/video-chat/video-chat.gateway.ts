import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards, Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { VideoChatService } from './services/video-chat.service';
import { JwtService } from '@nestjs/jwt';
import { SocketJwtGuard } from './guards/socket-jwt.guard';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { OnGatewayInit } from '@nestjs/websockets';

@WebSocketGateway({ namespace: '/video', cors: true })
@UseGuards(SocketJwtGuard)
export class VideoChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        @Inject(forwardRef(() => VideoChatService))
        private readonly videoChatService: VideoChatService,
        private readonly jwtService: JwtService,
    ) { }

    // Called once after the gateway is initialized
    async afterInit(server: Server) {
        if (process.env.VIDEOCHAT_USE_REDIS === 'true' && process.env.REDIS_URL) {
            try {
                const pubClient = createClient({ url: process.env.REDIS_URL });
                const subClient = pubClient.duplicate();
                await pubClient.connect();
                await subClient.connect();
                server.adapter(createAdapter(pubClient, subClient));
                console.log('Socket.IO Redis adapter enabled');
            } catch (err) {
                console.warn('Failed to enable Socket.IO Redis adapter', err);
            }
        }
    }

    handleConnection(client: Socket) {
        // validate handshake token (redundant with guard but ensures handleConnection has user data)
        try {
            const token = (client.handshake?.auth && client.handshake.auth.token) || client.handshake?.query?.token;
            if (!token) {
                client.disconnect(true);
                return;
            }
            const decoded = this.jwtService.verify(token);
            (client as any).data = (client as any).data || {};
            (client as any).data.user = decoded;
            const userId = decoded.sub ?? decoded.userId;
            this.videoChatService.setUserSocket(userId, client.id);

            console.log('Socket connected (user):', client.id, decoded.sub ?? decoded.userId ?? 'unknown');
        } catch (err) {
            console.warn('Socket connection rejected:', err?.message ?? err);
            try {
                client.disconnect(true);
            } catch (e) {
                // ignore
            }
        }
    }

    async handleDisconnect(client: Socket) {
        console.log('Socket disconnected:', client.id);
        const userId = (client as any).data?.user?.sub ?? (client as any).data?.user?.userId;
        if (userId) {
            this.videoChatService.removeUserSocket(userId, client.id);
        }
    }

    @SubscribeMessage('createRoom')
    async onCreateRoom(@MessageBody() payload: { userId: string; name?: string }, @ConnectedSocket() socket: Socket) {
        const room = await this.videoChatService.createRoom(payload.userId, payload.name);
        // emit to all clients that a room was created
        this.server.emit('room_created', room);
        return { status: 'created', data: room };
    }

    @SubscribeMessage('joinRoom')
    @UsePipes(new ValidationPipe({ transform: true }))
    async onJoinRoom(
        @MessageBody() payload: { roomId: string; userId: string; role?: string },
        @ConnectedSocket() socket: Socket,
    ) {
        const { roomId, userId } = payload;
        // authorize: user in token must match the userId requesting to join
        const socketUser = (socket as any).data?.user;
        const tokenUserId = socketUser?.sub ?? socketUser?.userId;
        if (!tokenUserId || tokenUserId !== userId) {
            throw new WsException('Not authorized to join as this user');
        }

        const participant = await this.videoChatService.joinRoom(roomId, userId, payload.role);
        // join socket.io room
        socket.join(roomId);
        this.server.to(roomId).emit('participant_joined', participant);
        return { status: 'joined', data: participant };
    }

    @SubscribeMessage('reconnect_to_room')
    async handleReconnect(
        @MessageBody() payload: { roomId: string },
        @ConnectedSocket() socket: Socket,
    ) {
        const userId = (socket as any).data.user.sub ?? (socket as any).data.user.userId;

        await this.videoChatService.joinRoom(payload.roomId, userId);

        socket.join(payload.roomId);

        const participants = await this.videoChatService.listParticipants(payload.roomId);

        socket.emit('recovery_state', participants);

        this.server.to(payload.roomId).emit('participant_reconnected', userId);
    }


    @SubscribeMessage('leaveRoom')
    async onLeaveRoom(@MessageBody() payload: { roomId: string; userId: string }, @ConnectedSocket() socket: Socket) {
        const { roomId, userId } = payload;

        const socketUser = (socket as any).data?.user;
        const tokenUserId = socketUser?.sub ?? socketUser?.userId;
        if (!tokenUserId || tokenUserId !== userId) {
            throw new WsException('Not authorized to leave as this user');
        }

        await this.videoChatService.leaveRoom(roomId, userId);
        socket.leave(roomId);
        this.server.to(roomId).emit('participant_left', { roomId, userId });
        return { status: 'left' };
    }

    // Methods to be called programmatically by the service
    broadcastRoomCreated(room: any) {
        try {
            this.server?.emit('room_created', room);
        } catch (err) {

            console.warn('broadcastRoomCreated failed', err);
        }
    }

    broadcastParticipantJoined(roomId: string, participant: any) {
        try {
            this.server?.to(roomId).emit('participant_joined', participant);
        } catch (err) {

            console.warn('broadcastParticipantJoined failed', err);
        }
    }

    broadcastParticipantLeft(roomId: string, participant: any) {
        try {
            this.server?.to(roomId).emit('participant_left', participant);
        } catch (err) {

            console.warn('broadcastParticipantLeft failed', err);
        }
    }

    /* ────────────────── HARDENED WEBRTC SIGNALING ────────────────── */

    @UsePipes(new ValidationPipe({ whitelist: true }))
    @SubscribeMessage('webrtc_offer')
    handleOffer(
        @MessageBody() payload: { roomId: string; to: string; offer: any },
        @ConnectedSocket() socket: Socket,
    ) {
        this.validateRoomAccess(socket, payload.roomId, payload.to);

        const userId = (socket as any).data.user.sub ?? (socket as any).data.user.userId;

        this.server.to(payload.to).emit('webrtc_offer', { from: userId, offer: payload.offer });
    }

    @UsePipes(new ValidationPipe({ whitelist: true }))
    @SubscribeMessage('webrtc_answer')
    handleAnswer(
        @MessageBody() payload: { roomId: string; to: string; answer: any },
        @ConnectedSocket() socket: Socket,
    ) {
        this.validateRoomAccess(socket, payload.roomId, payload.to);

        const userId = (socket as any).data.user.sub ?? (socket as any).data.user.userId;

        this.server.to(payload.to).emit('webrtc_answer', { from: userId, answer: payload.answer });
    }

    @UsePipes(new ValidationPipe({ whitelist: true }))
    @SubscribeMessage('webrtc_ice_candidate')
    handleIceCandidate(
        @MessageBody() payload: { roomId: string; to: string; candidate: any },
        @ConnectedSocket() socket: Socket,
    ) {
        this.validateRoomAccess(socket, payload.roomId, payload.to);

        const userId = (socket as any).data.user.sub ?? (socket as any).data.user.userId;

        this.server.to(payload.to).emit('webrtc_ice_candidate', { from: userId, candidate: payload.candidate });
    }

    /* ────────────────── SECURITY UTILITIES ────────────────── */

    private validateRoomAccess(socket: Socket, roomId: string, targetSocketId: string) {
        if (!socket.rooms.has(roomId)) {
            throw new WsException('Not in room');
        }

        const targetSocket = this.server.sockets.sockets.get(targetSocketId);
        if (!targetSocket || !targetSocket.rooms.has(roomId)) {
            throw new WsException('Target not in room');
        }
    }

}
