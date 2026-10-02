import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client?: Redis;
  private readonly memory = new Map<string, { value: string; expiresAt?: number }>();
  readonly enabled: boolean;

  constructor(private config: ConfigService) {
    this.enabled = this.config.get<boolean>('redis.enabled', true);
    if (this.enabled) {
      this.client = new Redis({
        host: this.config.get<string>('redis.host'),
        port: this.config.get<number>('redis.port'),
        password: this.config.get<string>('redis.password'),
        db: this.config.get<number>('redis.db'),
        maxRetriesPerRequest: null,
      });
    }
  }

  getClient(): Redis {
    if (!this.client) throw new Error('Redis is disabled; development memory store is active');
    return this.client;
  }

  async ping(): Promise<'PONG' | 'MEMORY'> {
    return this.client ? this.client.ping() : 'MEMORY';
  }

  async get(key: string): Promise<string | null> {
    if (this.client) return this.client.get(key);
    const item = this.memory.get(key);
    if (!item) return null;
    if (item.expiresAt && item.expiresAt <= Date.now()) {
      this.memory.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.client) {
      if (ttlSeconds) await this.client.setex(key, ttlSeconds, value);
      else await this.client.set(key, value);
      return;
    }
    this.memory.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async del(key: string): Promise<void> {
    if (this.client) await this.client.del(key);
    else this.memory.delete(key);
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
    this.memory.clear();
  }
}
