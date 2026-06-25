import { Module } from '@nestjs/common';
import { ProgrammesController } from './controllers/programmes.controller';
import { ProgrammesService } from './services/programmes.service';
import { ProgrammesRepository } from './repositories/programmes.repository';

@Module({
  controllers: [ProgrammesController],
  providers: [ProgrammesService, ProgrammesRepository],
  exports: [ProgrammesService, ProgrammesRepository],
})
export class ProgrammesModule {}
