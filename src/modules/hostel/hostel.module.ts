import { Module } from '@nestjs/common';
import { HostelController } from './controllers/hostel.controller';
import { HostelService } from './services/hostel.service';
import { HostelRepository } from './repositories/hostel.repository';

@Module({
  controllers: [HostelController],
  providers: [HostelService, HostelRepository],
  exports: [HostelService, HostelRepository],
})
export class HostelModule {}
