import { Module } from '@nestjs/common';
import { AuthorizationController } from './controllers/authorization.controller';
import { AuthorizationService } from './services/authorization.service';
import { AuthorizationRepository } from './repositories/authorization.repository';

@Module({
  controllers: [AuthorizationController],
  providers: [AuthorizationService, AuthorizationRepository],
  exports: [AuthorizationService, AuthorizationRepository],
})
export class AuthorizationModule {}
