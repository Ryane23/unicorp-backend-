import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { SessionStoreService } from './session-store.service';
import { OtpStoreService } from './otp-store.service';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [RedisService, SessionStoreService, OtpStoreService, CacheService],
  exports: [RedisService, SessionStoreService, OtpStoreService, CacheService],
})
export class RedisModule {}
