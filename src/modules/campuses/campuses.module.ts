import { Module } from '@nestjs/common';
import { CampusesController } from './controllers/campuses.controller';
import { CampusesService } from './services/campuses.service';
import { CampusesRepository } from './repositories/campuses.repository';

@Module({
  controllers: [CampusesController],
  providers: [CampusesService, CampusesRepository],
  exports: [CampusesService, CampusesRepository],
})
export class CampusesModule {}
