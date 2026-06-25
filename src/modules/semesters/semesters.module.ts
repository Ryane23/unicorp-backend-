import { Module } from '@nestjs/common';
import { SemestersController } from './controllers/semesters.controller';
import { SemestersService } from './services/semesters.service';
import { SemestersRepository } from './repositories/semesters.repository';

@Module({
  controllers: [SemestersController],
  providers: [SemestersService, SemestersRepository],
  exports: [SemestersService, SemestersRepository],
})
export class SemestersModule {}
