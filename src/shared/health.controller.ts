import { Controller, Get } from '@nestjs/common';
import { Public } from '@/common/decorators/permissions.decorator';
import { PrismaService } from '@/database/prisma.service';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Check API, PostgreSQL, and session-store health' })
  @ApiOkResponse({
    description: 'Current health of the API dependencies.',
    schema: {
      example: {
        success: true,
        message: 'Operation successful',
        data: {
          status: 'healthy',
          checks: { database: 'ok', redis: 'memory' },
          timestamp: '2026-10-05T10:00:00.000Z',
        },
        timestamp: '2026-10-05T10:00:00.000Z',
      },
    },
  })
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
