import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class CacheService {
  private readonly prefix = 'cache:';

  constructor(private redis: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(`${this.prefix}${key}`);
    return raw ? JSON.parse(raw) : null;
  }

  async set(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
    await this.redis.set(`${this.prefix}${key}`, JSON.stringify(value), ttlSeconds);
  }

  async invalidate(key: string): Promise<void> {
    await this.redis.del(`${this.prefix}${key}`);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const client = this.redis.getClient();
    const keys = await client.keys(`${this.prefix}${pattern}`);
    if (keys.length) await client.del(...keys);
  }
}
