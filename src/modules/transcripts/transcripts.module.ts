import { Module } from '@nestjs/common';
import { TranscriptsController } from './controllers/transcripts.controller';
import { TranscriptsService } from './services/transcripts.service';
import { TranscriptsRepository } from './repositories/transcripts.repository';

@Module({
  controllers: [TranscriptsController],
  providers: [TranscriptsService, TranscriptsRepository],
  exports: [TranscriptsService, TranscriptsRepository],
})
export class TranscriptsModule {}
