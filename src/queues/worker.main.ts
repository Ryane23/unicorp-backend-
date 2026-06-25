import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('UniCore ERP BullMQ Worker started');
  await app.init();
}

bootstrap();
