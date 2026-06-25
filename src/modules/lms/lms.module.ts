import { Module } from '@nestjs/common';
import { LmsController } from './controllers/lms.controller';
import { LmsService } from './services/lms.service';
import { LmsRepository } from './repositories/lms.repository';

@Module({
  controllers: [LmsController],
  providers: [LmsService, LmsRepository],
  exports: [LmsService, LmsRepository],
})
export class LmsModule {}
