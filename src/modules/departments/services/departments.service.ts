import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DepartmentsRepository } from '../repositories/departments.repository';
import { PaginationDto, PaginatedResult } from '@/shared/dto/pagination.dto';
import { CreateDepartmentsDto, UpdateDepartmentsDto } from '../dto/create-departments.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly repository: DepartmentsRepository) {}

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    return this.repository.findAll(query);
  }

  async findOne(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException('Department not found');
    return item;
  }

  async create(dto: CreateDepartmentsDto, actorId: string) {
    await this.assertFaculty(dto.facultyId);
    try {
      return await this.repository.create(this.normalize(dto), actorId);
    } catch (error) {
      this.handleUniqueConstraint(error);
    }
  }

  async update(id: string, dto: UpdateDepartmentsDto, actorId: string) {
    await this.findOne(id);
    if (dto.facultyId) await this.assertFaculty(dto.facultyId);
    try {
      return await this.repository.update(id, this.normalize(dto), actorId);
    } catch (error) {
      this.handleUniqueConstraint(error);
    }
  }

  async remove(id: string, actorId: string) {
    await this.findOne(id);
    const usage = await this.repository.getActiveUsage(id);
    const total = usage.programs + usage.lecturers + usage.courses;
    if (total) {
      throw new BadRequestException(
        `Department cannot be archived while it has ${usage.programs} programme(s), ${usage.lecturers} lecturer(s), and ${usage.courses} course(s)`,
      );
    }
    return this.repository.softDelete(id, actorId);
  }

  private async assertFaculty(facultyId: string) {
    if (!(await this.repository.facultyExists(facultyId))) {
      throw new BadRequestException('Selected faculty does not exist or is archived');
    }
  }

  private normalize<T extends CreateDepartmentsDto | UpdateDepartmentsDto>(dto: T): T {
    return {
      ...dto,
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.code !== undefined ? { code: dto.code.trim().toUpperCase() } : {}),
      ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
    };
  }

  private handleUniqueConstraint(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('A department with this name or code already exists');
    }
    throw error;
  }
}
