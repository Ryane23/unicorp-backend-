import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression = require('compression');
import cookieParser = require('cookie-parser');
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', 3000);
  const apiPrefix = config.get<string>('app.apiPrefix', 'api/v1');
  const corsOrigins = config.get<string[]>('cors.origins', []);

  app.setGlobalPrefix(apiPrefix);

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('UniCore ERP API')
    .setDescription('University Enterprise Resource Planning System - REST API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Login, logout, refresh tokens, 2FA')
    .addTag('Students', 'Student records and management')
    .addTag('Admissions', 'Online applications and admission workflow')
    .addTag('Finance', 'Fees, payments, invoices')
    .addTag('Results', 'Grades, GPA, result approval')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true, docExpansion: 'none' },
  });

  await app.listen(port);
  console.log(`UniCore ERP running on http://localhost:${port}/${apiPrefix}`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
