import { Module } from '@nestjs/common';
import { AdmissionsController } from './controllers/admissions.controller';
import { AdmissionsService } from './services/admissions.service';
import { AdmissionsRepository } from './repositories/admissions.repository';

@Module({
  controllers: [AdmissionsController],
  providers: [AdmissionsService, AdmissionsRepository],
  exports: [AdmissionsService, AdmissionsRepository],
})
export class AdmissionsModule {}
