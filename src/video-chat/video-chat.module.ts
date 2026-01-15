import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VideoChatService } from './services/video-chat.service';
import { VideoChatController } from './controllers/video-chat.controller';
import { UserModule } from '../user/user.module';
import { Room } from './models/room.model';
import { RoomParticipant } from './models/room-participant.model';
import { VideoChatGateway } from './video-chat.gateway';
import { SocketJwtGuard } from './guards/socket-jwt.guard';
import { AuthModule } from '../auth/auth.module';
import { VideoChatHealthService } from './services/video-chat.health.service';
import { VideoChatHealthController } from './controllers/video-chat.health.controller';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET_KEY,
            signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
        }),
        CacheModule.registerAsync({
            useFactory: async () => ({
                store: redisStore,
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
                password: process.env.REDIS_PASSWORD || undefined,
                db: parseInt(process.env.REDIS_DB_VIDEOCHAT || '1', 10),
                ttl: parseInt(process.env.REDIS_TTL || '60', 10),
            }),
        }),
        SequelizeModule.forFeature([Room, RoomParticipant]),
        forwardRef(() => UserModule),
        forwardRef(() => AuthModule)
    ],
    providers: [VideoChatService, VideoChatGateway, SocketJwtGuard, VideoChatHealthService],
    controllers: [VideoChatController, VideoChatHealthController],
    exports: [VideoChatService, VideoChatGateway],
})

export class VideoChatModule { }
