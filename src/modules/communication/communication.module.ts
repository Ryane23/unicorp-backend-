import { Module } from '@nestjs/common';
import { CommunicationController } from './controllers/communication.controller';
import { CommunicationService } from './services/communication.service';
import { CommunicationRepository } from './repositories/communication.repository';

@Module({
  controllers: [CommunicationController],
  providers: [CommunicationService, CommunicationRepository],
  exports: [CommunicationService, CommunicationRepository],
})
export class CommunicationModule {}
