import { Module } from '@nestjs/common';
import { SystemSettingsController } from './controllers/system-settings.controller';
import { SystemSettingsService } from './services/system-settings.service';
import { SystemSettingsRepository } from './repositories/system-settings.repository';

@Module({
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService, SystemSettingsRepository],
  exports: [SystemSettingsService, SystemSettingsRepository],
})
export class SystemSettingsModule {}
