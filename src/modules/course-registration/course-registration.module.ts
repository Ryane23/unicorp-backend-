import { Module } from '@nestjs/common';
import { CourseRegistrationController } from './controllers/course-registration.controller';
import { CourseRegistrationService } from './services/course-registration.service';
import { CourseRegistrationRepository } from './repositories/course-registration.repository';

@Module({
  controllers: [CourseRegistrationController],
  providers: [CourseRegistrationService, CourseRegistrationRepository],
  exports: [CourseRegistrationService, CourseRegistrationRepository],
})
export class CourseRegistrationModule {}
