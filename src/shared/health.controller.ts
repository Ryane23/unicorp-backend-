import { Controller, Get } from '@nestjs/common';
import { Public } from '@/common/decorators/permissions.decorator';
import { PrismaService } from '@/database/prisma.service';
import { RedisService } from '@/infrastructure/redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Public()
  @Get()
  async check() {
    const checks = { database: 'ok', redis: this.redis.enabled ? 'ok' : 'memory' };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      checks.database = 'error';
    }

    try {
      await this.redis.ping();
    } catch {
      checks.redis = 'error';
    }

    const healthy = checks.database === 'ok' && ['ok', 'memory'].includes(checks.redis);
    return { status: healthy ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() };
  }
}
