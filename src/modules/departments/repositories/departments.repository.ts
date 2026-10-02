import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationDto, PaginatedResult, buildPaginationMeta } from '@/shared/dto/pagination.dto';
import { AuditAction, Prisma } from '@prisma/client';

const departmentInclude = {
  faculty: { select: { id: true, name: true, code: true } },
  _count: {
    select: {
      programs: { where: { deletedAt: null } },
      lecturers: { where: { deletedAt: null } },
      courses: { where: { deletedAt: null } },
    },
  },
} as const;

const toJson = (value: unknown) =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

@Injectable()
export class DepartmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;
    const allowedSorts = ['createdAt', 'updatedAt', 'name', 'code'];
    const orderField = allowedSorts.includes(sortBy) ? sortBy : 'createdAt';
    const where = {
      deletedAt: null,
      ...(query.filter ? { facultyId: query.filter } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { code: { contains: query.search, mode: 'insensitive' as const } },
              { faculty: { name: { contains: query.search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.departments.findMany({
        where,
        include: departmentInclude,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
      }),
      this.prisma.departments.count({ where }),
    ]);
    return { data, meta: buildPaginationMeta(total, page, limit) };
  }

  async findById(id: string) {
    return this.prisma.departments.findFirst({
      where: { id, deletedAt: null },
      include: departmentInclude,
    });
  }

  async create(
    data: { name: string; code: string; facultyId: string; description?: string | null },
    actorId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const department = await tx.departments.create({ data, include: departmentInclude });
      await tx.auditLogs.create({
        data: {
          userId: actorId,
          action: AuditAction.CREATE,
          entityType: 'Department',
          entityId: department.id,
          newValue: toJson(department),
        },
      });
      return department;
    });
  }

  async update(
    id: string,
    data: { name?: string; code?: string; facultyId?: string; description?: string | null },
    actorId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.departments.findUniqueOrThrow({ where: { id } });
      const department = await tx.departments.update({
        where: { id },
        data,
        include: departmentInclude,
      });
      await tx.auditLogs.create({
        data: {
          userId: actorId,
          action: AuditAction.UPDATE,
          entityType: 'Department',
          entityId: department.id,
          oldValue: toJson(previous),
          newValue: toJson(department),
        },
      });
      return department;
    });
  }

  async softDelete(id: string, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.departments.findUniqueOrThrow({ where: { id } });
      const department = await tx.departments.update({
        where: { id },
        data: { deletedAt: new Date() },
        include: departmentInclude,
      });
      await tx.auditLogs.create({
        data: {
          userId: actorId,
          action: AuditAction.DELETE,
          entityType: 'Department',
          entityId: department.id,
          oldValue: toJson(previous),
          newValue: toJson(department),
        },
      });
      return department;
    });
  }

  facultyExists(id: string) {
    return this.prisma.faculties.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
  }

  async getActiveUsage(id: string) {
    const [programs, lecturers, courses] = await Promise.all([
      this.prisma.programs.count({ where: { departmentId: id, deletedAt: null } }),
      this.prisma.lecturers.count({ where: { departmentId: id, deletedAt: null } }),
      this.prisma.courses.count({ where: { departmentId: id, deletedAt: null } }),
    ]);
    return { programs, lecturers, courses };
  }
}
