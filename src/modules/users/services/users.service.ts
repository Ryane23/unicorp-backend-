import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { PaginationDto, PaginatedResult } from '@/shared/dto/pagination.dto';
import { TenantContext } from '@/common/context/tenant.context';
import { CreateUsersDto, UpdateUsersDto } from '../dto/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    return this.repository.findAll(this.tenantContext.tenantId, query);
  }

  async findOne(id: string) {
    const item = await this.repository.findById(this.tenantContext.tenantId, id);
    if (!item) throw new NotFoundException('Users not found');
    return item;
  }

  async create(dto: CreateUsersDto) {
    const [firstName, ...lastNames] = dto.fullName.split(' ');
    const lastName = lastNames.join(' ') || 'User';

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.repository.create(this.tenantContext.tenantId, {
      email: dto.email,
      passwordHash,
      firstName,
      lastName,
      status: 'ACTIVE',
      institutionId: dto.institutionId,
      campusId: dto.campusId,
    });

    if (dto.role) {
      await this.repository.assignRole(this.tenantContext.tenantId, user.id, dto.role.toLowerCase());
    }

    return user;
  }

  async update(id: string, dto: UpdateUsersDto) {
    await this.findOne(id);
    const data: any = { ...dto };

    if (dto.fullName) {
      const [firstName, ...lastNames] = dto.fullName.split(' ');
      data.firstName = firstName;
      data.lastName = lastNames.join(' ') || 'User';
      delete data.fullName;
    }

    return this.repository.update(this.tenantContext.tenantId, id, data);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.softDelete(this.tenantContext.tenantId, id);
  }
}
