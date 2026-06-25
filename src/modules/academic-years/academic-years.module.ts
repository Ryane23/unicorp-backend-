import { Module } from '@nestjs/common';
import { AcademicYearsController } from './controllers/academic-years.controller';
import { AcademicYearsService } from './services/academic-years.service';
import { AcademicYearsRepository } from './repositories/academic-years.repository';

@Module({
  controllers: [AcademicYearsController],
  providers: [AcademicYearsService, AcademicYearsRepository],
  exports: [AcademicYearsService, AcademicYearsRepository],
})
export class AcademicYearsModule {}
