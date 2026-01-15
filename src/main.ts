import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { setupSwagger } from './swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as bodyParser from 'body-parser';
import { UserIdInterceptor } from './auth/GuardsDecorMiddleware/userId-interceptor.middleware';
import { JwtService } from '@nestjs/jwt';
import { UserIdMiddleware } from './auth/GuardsDecorMiddleware/user-id.middleware';
import { RedisIoAdapter } from './redis.adapter';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'fatal', 'debug', 'verbose'],
  });

  const secretKey = process.env.JWT_SECRET_KEY || 'default-secret-key';
  const jwtService = new JwtService({ secret: secretKey });
  const userIdMiddleware = new UserIdMiddleware(jwtService);
  app.use(userIdMiddleware.use.bind(userIdMiddleware));
  app.useGlobalInterceptors(new UserIdInterceptor(jwtService));

  // Enable CORS
  app.enableCors({
    origin: '*', // Replace '' with specific origins in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Forwarded-For', // Include X-Forwarded-For
  });

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe());
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

  app.useStaticAssets(join(__dirname, '..', 'uploads')); // Serve static files

  // Security with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Adjust as per requirements
    }),
  );

  app.set('trust proxy', 1); // Adjust based on your proxy setup

  // Rate Limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  // Setup Swagger
  setupSwagger(app);

  if (process.env.VIDEOCHAT_USE_REDIS === 'true') {
    const redisAdapter = new RedisIoAdapter(app);
    await redisAdapter.connectToRedis();
    app.useWebSocketAdapter(redisAdapter);
    console.log('Using Redis for WebSocket adapter');
  }

  // Synchronize Sequelize models
  const sequelize = app.get(Sequelize);
  try {
    // Adjust force carefully and Please be careful as it can cause the loss of data
    await sequelize.sync({ alter: false }); // Adjust force carefully
    console.log('Database synchronization completed successfully.');
  } catch (error) {
    console.error('Error during database synchronization:', error);
  } finally {
    console.log('App listening on PORT', process.env.PORT || 3000);
  }

  await app.listen(process.env.PORT || 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
