import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HrService } from '../services/hr.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Hr')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get()
  @ApiOperation({ summary: 'List all hr' })
  @RequirePermissions('hr:read')
  findAll(@Query() query: PaginationDto) {
    return this.hrService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hr by ID' })
  @RequirePermissions('hr:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create hr' })
  @RequirePermissions('hr:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.hrService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update hr' })
  @RequirePermissions('hr:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.hrService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete hr' })
  @RequirePermissions('hr:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.remove(id);
  }
}
