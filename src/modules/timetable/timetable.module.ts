import { Module } from '@nestjs/common';
import { TimetableController } from './controllers/timetable.controller';
import { TimetableService } from './services/timetable.service';
import { TimetableRepository } from './repositories/timetable.repository';

@Module({
  controllers: [TimetableController],
  providers: [TimetableService, TimetableRepository],
  exports: [TimetableService, TimetableRepository],
})
export class TimetableModule {}
