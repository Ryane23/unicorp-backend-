import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationDto, PaginatedResult, buildPaginationMeta } from '@/shared/dto/pagination.dto';

@Injectable()
export class AuditLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: PaginationDto): Promise<PaginatedResult<unknown>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;
    // Override in module-specific repository with actual Prisma model
    return { data: [], meta: buildPaginationMeta(0, page, limit) };
  }

  async findById(tenantId: string, id: string) {
    return null;
  }

  async create(tenantId: string, data: Record<string, unknown>) {
    return { id: crypto.randomUUID(), tenantId, ...data };
  }

  async update(tenantId: string, id: string, data: Record<string, unknown>) {
    return { id: crypto.randomUUID(), tenantId, ...data };
  }

  async softDelete(tenantId: string, id: string) {
    return { id: id, deleted: true };
  }
}
