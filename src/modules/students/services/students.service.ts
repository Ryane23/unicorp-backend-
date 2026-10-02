import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentsRepository } from '../repositories/students.repository';
import { PaginationDto, PaginatedResult } from '@/shared/dto/pagination.dto';
import { CreateStudentsDto, UpdateStudentsDto } from '../dto/create-students.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly repository: StudentsRepository) {}

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    return this.repository.findAll(query);
  }

  async findOne(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException('Students not found');
    return item;
  }

  async create(dto: CreateStudentsDto) {
    return this.repository.create({
      ...dto,
      dateOfBirth: new Date(dto.dateOfBirth),
      admissionDate: new Date(dto.admissionDate),
    });
  }

  async update(id: string, dto: UpdateStudentsDto) {
    await this.findOne(id);
    const { dateOfBirth, ...data } = dto;
    return this.repository.update(id, {
      ...data,
      ...(dateOfBirth ? { dateOfBirth: new Date(dateOfBirth) } : {}),
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.softDelete(id);
  }
}
