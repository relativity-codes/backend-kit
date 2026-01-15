import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Room } from '../models/room.model';
import { RoomParticipant } from '../models/room-participant.model';
import { Sequelize } from 'sequelize-typescript';
import { VideoChatGateway } from 'src/video-chat/video-chat.gateway';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class VideoChatService {
  constructor(
    @InjectModel(Room) private readonly roomModel: typeof Room,
    @InjectModel(RoomParticipant) private readonly participantModel: typeof RoomParticipant,
    private readonly sequelize: Sequelize,
    @Inject(forwardRef(() => VideoChatGateway)) private readonly gateway: VideoChatGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  private async generateJwtToken(payload: any, ttlSeconds: number): Promise<string> {
    const secretKey = process.env.JWT_SECRET_KEY || 'default-secret-key';
    const { exp, ...rest } = payload;
    return jwt.sign(rest, secretKey, { expiresIn: ttlSeconds });
  }


  // Redis-backed socket mapping
  async setUserSocket(userId: string, socketId: string) {
    const ttl = parseInt(process.env.VIDEOCHAT_SOCKET_TTL || '300', 10); // seconds
    await this.cacheManager.set(`user:${userId}:socket`, socketId, ttl);
    await this.cacheManager.set(`socket:${socketId}:user`, userId, ttl);
  }

  async getUserSocket(userId: string) {
    return this.cacheManager.get<string>(`user:${userId}:socket`);
  }

  async removeUserSocket(userId: string, socketId: string) {
    const storedSocket = await this.cacheManager.get(`user:${userId}:socket`);
    if (storedSocket === socketId) await this.cacheManager.del(`user:${userId}:socket`);
    await this.cacheManager.del(`socket:${socketId}:user`);
  }
  async createRoom(hostUserId: string, name?: string) {
    const room = await this.roomModel.create({ hostUserId, name: name ?? `room-${Date.now()}` });
    try {
      this.gateway?.broadcastRoomCreated(room);
    } catch (err) {
      // swallow to avoid affecting HTTP flow
      console.warn('Failed to broadcast room creation via gateway', err);
    }
    return room;
  }

  async findRoomById(id: string) {
    return this.roomModel.findByPk(id);
  }

  async listRooms() {
    return this.roomModel.findAll({ where: { isActive: true }, order: [['createdAt', 'DESC']] });
  }

  async joinRoom(roomId: string, userId: string, role = 'PEER') {
    const t = await this.sequelize.transaction();
    try {
      const room = await this.roomModel.findByPk(roomId, { transaction: t, lock: true });
      if (!room) throw new NotFoundException('Room not found');

      const participant = await this.participantModel.create(
        { roomId, userId, role },
        { transaction: t },
      );

      await t.commit();

      try {
        this.gateway?.broadcastParticipantJoined(roomId, participant);
      } catch (err) {

        console.warn('Failed to broadcast participant joined', err);
      }
      return participant;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async leaveRoom(roomId: string, userId: string) {
    const participant = await this.participantModel.findOne({ where: { roomId, userId } });
    const deleted = await this.participantModel.destroy({ where: { roomId, userId } });
    if (deleted && participant) {
      try {
        this.gateway?.broadcastParticipantLeft(roomId, participant);
      } catch (err) {

        console.warn('Failed to broadcast participant left', err);
      }
    }
    return deleted;
  }

  async listParticipants(roomId: string) {
    return this.participantModel.findAll({ where: { roomId }, order: [['joinedAt', 'DESC']] });
  }

  // Generate ephemeral token and return ICE servers info
  async createToken(roomId: string, userId: string) {
    // ensure room exists
    const room = await this.roomModel.findByPk(roomId);
    if (!room) throw new NotFoundException('Room not found');

    // ensure the user is authorized (host or existing participant)
    const participant = await this.participantModel.findOne({ where: { roomId, userId } });
    if (room.hostUserId !== userId && !participant) {
      // For now require that the user is the host or already a participant to get a token
      throw new NotFoundException('Not authorized to get token for this room');
    }

    // parse ICE servers from env (JSON array) or fall back to public STUN
    let iceServers: any[] = [{ urls: 'stun:stun.l.google.com:19302' }];
    const env = process.env.VIDEOCHAT_ICE_SERVERS;
    if (env) {
      try {
        const parsed = JSON.parse(env);
        if (Array.isArray(parsed) && parsed.length > 0) {
          iceServers = parsed;
        }
      } catch (err) {

        console.warn('Invalid VIDEOCHAT_ICE_SERVERS JSON, falling back to default STUN', err);
      }
    }

    const ttlSeconds = parseInt(process.env.VIDEOCHAT_TOKEN_TTL_SECONDS || '300', 10);

    const tokenPayload = { roomId, userId }; // remove manual exp
    const token = await this.generateJwtToken(tokenPayload, ttlSeconds);

    // If a TURN secret is configured (coturn long-term shared secret), generate time-limited credentials
    const turnSecret = process.env.VIDEOCHAT_TURN_SECRET;
    if (turnSecret) {
      try {
        const expiry = Math.floor(Date.now() / 1000) + ttlSeconds;
        const username = `${expiry}:${userId}`;
        const crypto = await import('crypto');
        const hmac = crypto.createHmac('sha1', turnSecret).update(username).digest('base64');
        // attach credentials to any turn server entries in iceServers
        iceServers = iceServers.map((s) => {
          // s.urls can be string or array
          const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
          const hasTurn = urls.some((u) => typeof u === 'string' && u.startsWith('turn:'));
          if (!hasTurn) return s;
          return {
            ...s,
            username,
            credential: hmac,
          };
        });
      } catch (err) {

        console.warn('Failed to generate TURN credentials', err);
      }
    }

    return {
      token,
      provider: 'mock',
      ttlSeconds,
      iceServers,
    };
  }
}
