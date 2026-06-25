import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class OtpStoreService {
  private readonly prefix = 'otp:';

  constructor(private redis: RedisService) {}

  private key(identifier: string, purpose: string) {
    return `${this.prefix}${purpose}:${identifier}`;
  }

  async store(identifier: string, purpose: string, code: string, ttlSeconds = 300): Promise<void> {
    await this.redis.set(this.key(identifier, purpose), code, ttlSeconds);
  }

  async verify(identifier: string, purpose: string, code: string): Promise<boolean> {
    const stored = await this.redis.get(this.key(identifier, purpose));
    if (!stored || stored !== code) return false;
    await this.redis.del(this.key(identifier, purpose));
    return true;
  }
}
