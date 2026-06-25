import { Module } from '@nestjs/common';
import { ResultsController } from './controllers/results.controller';
import { ResultsService } from './services/results.service';
import { ResultsRepository } from './repositories/results.repository';

@Module({
  controllers: [ResultsController],
  providers: [ResultsService, ResultsRepository],
  exports: [ResultsService, ResultsRepository],
})
export class ResultsModule {}
