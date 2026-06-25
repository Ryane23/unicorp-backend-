import { Module } from '@nestjs/common';
import { InstitutionsController } from './controllers/institutions.controller';
import { InstitutionsService } from './services/institutions.service';
import { InstitutionsRepository } from './repositories/institutions.repository';

@Module({
  controllers: [InstitutionsController],
  providers: [InstitutionsService, InstitutionsRepository],
  exports: [InstitutionsService, InstitutionsRepository],
})
export class InstitutionsModule {}
