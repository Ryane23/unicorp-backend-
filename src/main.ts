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
    .setDescription([
      'REST API for the UniCore university and academic management system.',
      '',
      '### Using authenticated endpoints',
      '1. Run the development seed with `npm run prisma:seed`.',
      '2. Call `POST /api/v1/auth/login` with `admin@unicore.edu` and the configured demo password.',
      '3. Copy the returned `accessToken` into the **Authorize** dialog as a Bearer token.',
      '',
      'All successful responses use the `{ success, message, data, timestamp }` envelope. '
        + 'Validation and authorization failures use the documented error envelope.',
    ].join('\n'))
    .setVersion('1.1.0')
    .addServer(`http://localhost:${port}`, 'Local development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the accessToken returned by POST /api/v1/auth/login.',
      },
      'bearer',
    )
    .addTag('System', 'Health and infrastructure readiness')
    .addTag('Authentication', 'Login, logout, token refresh, password reset, and sessions')
    .addTag('Dashboards', 'Role-specific university dashboard summaries')
    .addTag('Users', 'Accounts, roles, and account status')
    .addTag('Students', 'Student records and academic profiles')
    .addTag('Faculties', 'Faculty structure and department totals')
    .addTag('Departments', 'Departments and their academic dependencies')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs-json',
    yamlDocumentUrl: 'docs-yaml',
    customSiteTitle: 'UniCore API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      displayRequestDuration: true,
      filter: true,
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
    },
  });

  await app.listen(port);
  console.log(`UniCore ERP running on http://localhost:${port}/${apiPrefix}`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
  console.log(`OpenAPI JSON: http://localhost:${port}/docs-json`);
}

bootstrap();
