/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication<any>) => {
  const options = new DocumentBuilder()
    .setTitle('Backend API')
    .setDescription(`Backend API Documentation`)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // Generate the OpenAPI document (Swagger JSON)
  const document = SwaggerModule.createDocument(app, options, {
    deepScanRoutes: true,
  });

  // Set up the Swagger UI at /api
  SwaggerModule.setup('api', app, document);

  app
    .getHttpAdapter()
    .getInstance()
    .get('/api-json', (req, res) => {
      res.json(document);
    });
};
