import { Module } from '@nestjs/common';
import { FinanceController } from './controllers/finance.controller';
import { FinanceService } from './services/finance.service';
import { FinanceRepository } from './repositories/finance.repository';

@Module({
  controllers: [FinanceController],
  providers: [FinanceService, FinanceRepository],
  exports: [FinanceService, FinanceRepository],
})
export class FinanceModule {}
