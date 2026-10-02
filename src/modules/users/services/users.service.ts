import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { PaginationDto, PaginatedResult } from '@/shared/dto/pagination.dto';
import { CreateUsersDto, UpdateUsersDto } from '../dto/users.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    return this.repository.findAll(query);
  }

  async findOne(id: string) {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException('Users not found');
    return item;
  }

  async create(dto: CreateUsersDto) {
    const [firstName, ...lastNames] = dto.fullName.split(' ');
    const lastName = lastNames.join(' ') || 'User';

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.repository.create({
      email: dto.email,
      username: `${dto.email.split('@')[0]}-${uuidv4().slice(0, 6)}`,
      passwordHash,
      firstName,
      lastName,
      status: UserStatus.ACTIVE,
      userType: dto.userType,
    });

    if (dto.role) {
      await this.repository.assignRole(user.id, dto.role.toUpperCase());
    }

    return user;
  }

  async update(id: string, dto: UpdateUsersDto) {
    await this.findOne(id);
    const { role, fullName, ...rest } = dto;
    const data: {
      email?: string;
      status?: UserStatus;
      firstName?: string;
      lastName?: string;
    } = { ...rest };

    if (fullName) {
      const [firstName, ...lastNames] = fullName.split(' ');
      data.firstName = firstName;
      data.lastName = lastNames.join(' ') || 'User';
    }

    const updated = await this.repository.update(id, data);
    if (role) await this.repository.assignRole(id, role.toUpperCase());
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.softDelete(id);
  }
}
