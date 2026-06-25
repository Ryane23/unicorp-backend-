import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditLogsService } from '../services/audit-logs.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('AuditLogs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List all audit logs' })
  @RequirePermissions('audit-logs:read')
  findAll(@Query() query: PaginationDto) {
    return this.auditLogsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit logs by ID' })
  @RequirePermissions('audit-logs:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditLogsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create audit logs' })
  @RequirePermissions('audit-logs:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.auditLogsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update audit logs' })
  @RequirePermissions('audit-logs:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.auditLogsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete audit logs' })
  @RequirePermissions('audit-logs:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditLogsService.remove(id);
  }
}
