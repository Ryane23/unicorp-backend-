import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FinanceService } from '../services/finance.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get()
  @ApiOperation({ summary: 'List all finance' })
  @RequirePermissions('finance:read')
  findAll(@Query() query: PaginationDto) {
    return this.financeService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get finance by ID' })
  @RequirePermissions('finance:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create finance' })
  @RequirePermissions('finance:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.financeService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update finance' })
  @RequirePermissions('finance:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.financeService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete finance' })
  @RequirePermissions('finance:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.remove(id);
  }
}
