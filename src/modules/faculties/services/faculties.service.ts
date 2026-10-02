import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FacultiesRepository } from '../repositories/faculties.repository';
import { PaginationDto, PaginatedResult } from '@/shared/dto/pagination.dto';
import { CreateFacultiesDto, UpdateFacultiesDto } from '../dto/create-faculties.dto';

@Injectable()
export class FacultiesService {
  constructor(private readonly repository: FacultiesRepository) {}

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    return this.repository.findAll(query);
  }

  async findOne(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException('Faculty not found');
    return item;
  }

  async create(dto: CreateFacultiesDto, actorId: string) {
    try {
      return await this.repository.create(this.normalize(dto), actorId);
    } catch (error) {
      this.handleUniqueConstraint(error);
    }
  }

  async update(id: string, dto: UpdateFacultiesDto, actorId: string) {
    await this.findOne(id);
    try {
      return await this.repository.update(id, this.normalize(dto), actorId);
    } catch (error) {
      this.handleUniqueConstraint(error);
    }
  }

  async remove(id: string, actorId: string) {
    await this.findOne(id);
    const activeDepartments = await this.repository.countActiveDepartments(id);
    if (activeDepartments) {
      throw new BadRequestException(
        `Faculty cannot be archived while it has ${activeDepartments} active department${activeDepartments === 1 ? '' : 's'}`,
      );
    }
    return this.repository.softDelete(id, actorId);
  }

  private normalize<T extends CreateFacultiesDto | UpdateFacultiesDto>(dto: T): T {
    return {
      ...dto,
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.code !== undefined ? { code: dto.code.trim().toUpperCase() } : {}),
      ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
    };
  }

  private handleUniqueConstraint(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('A faculty with this name or code already exists');
    }
    throw error;
  }
}
