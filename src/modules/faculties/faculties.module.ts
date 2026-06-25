import { Module } from '@nestjs/common';
import { FacultiesController } from './controllers/faculties.controller';
import { FacultiesService } from './services/faculties.service';
import { FacultiesRepository } from './repositories/faculties.repository';

@Module({
  controllers: [FacultiesController],
  providers: [FacultiesService, FacultiesRepository],
  exports: [FacultiesService, FacultiesRepository],
})
export class FacultiesModule {}
