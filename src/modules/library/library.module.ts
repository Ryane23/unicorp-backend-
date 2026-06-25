import { Module } from '@nestjs/common';
import { LibraryController } from './controllers/library.controller';
import { LibraryService } from './services/library.service';
import { LibraryRepository } from './repositories/library.repository';

@Module({
  controllers: [LibraryController],
  providers: [LibraryService, LibraryRepository],
  exports: [LibraryService, LibraryRepository],
})
export class LibraryModule {}
