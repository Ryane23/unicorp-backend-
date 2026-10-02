import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { PaginationDto, PaginatedResult, buildPaginationMeta } from '@/shared/dto/pagination.dto';
import { Gender, StudentStatus } from '@prisma/client';

const studentInclude = {
  user: {
    select: { id: true, firstName: true, lastName: true, email: true, status: true },
  },
  level: true,
  programs: { include: { program: { include: { department: true } } } },
} as const;

@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;
    const allowedSorts = ['createdAt', 'studentNo', 'admissionDate', 'status'];
    const orderField = allowedSorts.includes(sortBy) ? sortBy : 'createdAt';
    const status = Object.values(StudentStatus).includes(query.filter as StudentStatus)
      ? (query.filter as StudentStatus)
      : undefined;
    const where = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(query.search
        ? {
            OR: [
              { studentNo: { contains: query.search, mode: 'insensitive' as const } },
              { user: { firstName: { contains: query.search, mode: 'insensitive' as const } } },
              { user: { lastName: { contains: query.search, mode: 'insensitive' as const } } },
              { user: { email: { contains: query.search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.students.findMany({
        where,
        include: studentInclude,
        skip,
        take: limit,
        orderBy: { [orderField]: sortOrder },
      }),
      this.prisma.students.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, limit) };
  }

  async findById(id: string) {
    return this.prisma.students.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...studentInclude,
        enrollments: {
          include: {
            offering: { include: { course: true, semester: true } },
            grades: { include: { assessment: true } },
          },
        },
        attendance: { include: { session: true } },
      },
    });
  }

  async create(data: {
    userId: string;
    studentNo: string;
    gender: Gender;
    dateOfBirth: Date;
    levelId: string;
    admissionDate: Date;
    status?: StudentStatus;
    programId?: string;
  }) {
    const { programId, ...studentData } = data;
    return this.prisma.$transaction(async (tx) => {
      const student = await tx.students.create({ data: studentData });
      if (programId) {
        await tx.studentPrograms.create({
          data: { studentId: student.id, programId, isPrimary: true },
        });
      }
      return tx.students.findUniqueOrThrow({
        where: { id: student.id },
        include: studentInclude,
      });
    });
  }

  async update(
    id: string,
    data: {
      gender?: Gender;
      dateOfBirth?: Date;
      levelId?: string;
      status?: StudentStatus;
    },
  ) {
    return this.prisma.students.update({
      where: { id },
      data,
      include: studentInclude,
    });
  }

  async softDelete(id: string) {
    return this.prisma.students.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: studentInclude,
    });
  }
}
