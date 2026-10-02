import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationDto, PaginatedResult, buildPaginationMeta } from '@/shared/dto/pagination.dto';
import { AuditAction, Prisma } from '@prisma/client';

const facultyInclude = {
  _count: {
    select: { departments: { where: { deletedAt: null } } },
  },
} as const;

const toJson = (value: unknown) =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

@Injectable()
export class FacultiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;
    const allowedSorts = ['createdAt', 'updatedAt', 'name', 'code'];
    const orderField = allowedSorts.includes(sortBy) ? sortBy : 'createdAt';
    const where = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { code: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.faculties.findMany({
        where,
        include: facultyInclude,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
      }),
      this.prisma.faculties.count({ where }),
    ]);
    return { data, meta: buildPaginationMeta(total, page, limit) };
  }

  async findById(id: string) {
    return this.prisma.faculties.findFirst({
      where: { id, deletedAt: null },
      include: facultyInclude,
    });
  }

  async create(
    data: { name: string; code: string; description?: string | null },
    actorId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const faculty = await tx.faculties.create({ data, include: facultyInclude });
      await tx.auditLogs.create({
        data: {
          userId: actorId,
          action: AuditAction.CREATE,
          entityType: 'Faculty',
          entityId: faculty.id,
          newValue: toJson(faculty),
        },
      });
      return faculty;
    });
  }

  async update(
    id: string,
    data: { name?: string; code?: string; description?: string | null },
    actorId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.faculties.findUniqueOrThrow({ where: { id } });
      const faculty = await tx.faculties.update({
        where: { id },
        data,
        include: facultyInclude,
      });
      await tx.auditLogs.create({
        data: {
          userId: actorId,
          action: AuditAction.UPDATE,
          entityType: 'Faculty',
          entityId: faculty.id,
          oldValue: toJson(previous),
          newValue: toJson(faculty),
        },
      });
      return faculty;
    });
  }

  async softDelete(id: string, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const previous = await tx.faculties.findUniqueOrThrow({ where: { id } });
      const faculty = await tx.faculties.update({
        where: { id },
        data: { deletedAt: new Date() },
        include: facultyInclude,
      });
      await tx.auditLogs.create({
        data: {
          userId: actorId,
          action: AuditAction.DELETE,
          entityType: 'Faculty',
          entityId: faculty.id,
          oldValue: toJson(previous),
          newValue: toJson(faculty),
        },
      });
      return faculty;
    });
  }

  countActiveDepartments(id: string) {
    return this.prisma.departments.count({ where: { facultyId: id, deletedAt: null } });
  }
}
