import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationDto, PaginatedResult, buildPaginationMeta } from '@/shared/dto/pagination.dto';
import { UserStatus, UserType } from '@prisma/client';

const safeUserSelect = {
  id: true,
  email: true,
  username: true,
  userType: true,
  status: true,
  firstName: true,
  lastName: true,
  phone: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  roles: { include: { role: true } },
} as const;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;
    const allowedSorts = ['createdAt', 'firstName', 'lastName', 'email', 'status'];
    const orderField = allowedSorts.includes(sortBy) ? sortBy : 'createdAt';
    const where = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: 'insensitive' as const } },
              { firstName: { contains: query.search, mode: 'insensitive' as const } },
              { lastName: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        select: safeUserSelect,
        take: limit,
        skip,
        orderBy: { [orderField]: sortOrder },
      }),
      this.prisma.users.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, limit) };
  }

  async findById(id: string) {
    return this.prisma.users.findFirst({
      where: { id, deletedAt: null },
      select: safeUserSelect,
    });
  }

  async create(data: {
    email: string;
    username: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    userType: UserType;
    status: UserStatus;
  }) {
    return this.prisma.users.create({
      data,
      select: safeUserSelect,
    });
  }

  async update(id: string, data: { firstName?: string; lastName?: string; email?: string; status?: UserStatus }) {
    return this.prisma.users.update({
      where: { id },
      data,
      select: safeUserSelect,
    });
  }

  async softDelete(id: string) {
    return this.prisma.users.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: safeUserSelect,
    });
  }

  async assignRole(userId: string, roleSlug: string) {
    const role = await this.prisma.roles.findFirst({
      where: { slug: roleSlug },
    });
    if (role) {
      return this.prisma.userRoles.upsert({
        where: { userId_roleId: { userId, roleId: role.id } },
        update: {},
        create: { userId, roleId: role.id },
      });
    }
  }
}
