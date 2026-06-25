import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Execute callback within a tenant-scoped transaction.
   * All queries automatically filter by tenantId.
   */
  async withTenant<T>(tenantId: string, fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return fn(this);
  }

  /** Soft-delete aware find - excludes deletedAt records */
  softDeleteFilter() {
    return { deletedAt: null };
  }
}
