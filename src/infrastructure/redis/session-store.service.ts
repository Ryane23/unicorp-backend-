import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

export interface SessionData {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  createdAt: string;
}

@Injectable()
export class SessionStoreService {
  private readonly prefix = 'session:';
  private readonly ttl: number;

  constructor(
    private redis: RedisService,
    config: ConfigService,
  ) {
    this.ttl = config.get<number>('session.ttl', 604800);
  }

  private key(sessionId: string) {
    return `${this.prefix}${sessionId}`;
  }

  async create(sessionId: string, data: SessionData): Promise<void> {
    await this.redis.set(this.key(sessionId), JSON.stringify(data), this.ttl);
  }

  async get(sessionId: string): Promise<SessionData | null> {
    const raw = await this.redis.get(this.key(sessionId));
    return raw ? JSON.parse(raw) : null;
  }

  async destroy(sessionId: string): Promise<void> {
    await this.redis.del(this.key(sessionId));
  }

  async refresh(sessionId: string): Promise<void> {
    const data = await this.get(sessionId);
    if (data) await this.create(sessionId, data);
  }
}
