import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationDto, PaginatedResult, buildPaginationMeta } from '@/shared/dto/pagination.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.users.findMany({
        where: { tenantId, deletedAt: null },
        take: limit,
        skip,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.users.count({
        where: { tenantId, deletedAt: null },
      }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, limit) };
  }

  async findById(tenantId: string, id: string) {
    return this.prisma.users.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.users.create({
      data: {
        tenantId,
        ...data,
      },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    return this.prisma.users.update({
      where: { id, tenantId },
      data,
    });
  }

  async softDelete(tenantId: string, id: string) {
    return this.prisma.users.update({
      where: { id, tenantId },
      data: { deletedAt: new Date() },
    });
  }

  async assignRole(tenantId: string, userId: string, roleSlug: string) {
    const role = await this.prisma.roles.findFirst({
      where: { tenantId, slug: roleSlug },
    });
    if (role) {
      return this.prisma.userRoles.create({
        data: { tenantId, userId, roleId: role.id },
      });
    }
  }
}
