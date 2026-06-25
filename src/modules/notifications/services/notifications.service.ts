import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { PaginationDto, PaginatedResult } from '@/shared/dto/pagination.dto';
import { TenantContext } from '@/common/context/tenant.context';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly repository: NotificationsRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async findAll(query: PaginationDto): Promise<PaginatedResult<unknown>> {
    return this.repository.findAll(this.tenantContext.tenantId, query);
  }

  async findOne(id: string) {
    const item = await this.repository.findById(this.tenantContext.tenantId, id);
    if (!item) throw new NotFoundException('Notifications not found');
    return item;
  }

  async create(dto: Record<string, unknown>) {
    return this.repository.create(this.tenantContext.tenantId, dto);
  }

  async update(id: string, dto: Record<string, unknown>) {
    await this.findOne(id);
    return this.repository.update(this.tenantContext.tenantId, id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.repository.softDelete(this.tenantContext.tenantId, id);
  }
}
