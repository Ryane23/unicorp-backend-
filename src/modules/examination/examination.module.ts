import { Module } from '@nestjs/common';
import { ExaminationController } from './controllers/examination.controller';
import { ExaminationService } from './services/examination.service';
import { ExaminationRepository } from './repositories/examination.repository';

@Module({
  controllers: [ExaminationController],
  providers: [ExaminationService, ExaminationRepository],
  exports: [ExaminationService, ExaminationRepository],
})
export class ExaminationModule {}
