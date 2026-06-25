import { Module } from '@nestjs/common';
import { HrController } from './controllers/hr.controller';
import { HrService } from './services/hr.service';
import { HrRepository } from './repositories/hr.repository';

@Module({
  controllers: [HrController],
  providers: [HrService, HrRepository],
  exports: [HrService, HrRepository],
})
export class HrModule {}
