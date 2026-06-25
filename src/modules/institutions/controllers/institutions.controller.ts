import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InstitutionsService } from '../services/institutions.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Institutions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all institutions' })
  @RequirePermissions('institutions:read')
  findAll(@Query() query: PaginationDto) {
    return this.institutionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get institutions by ID' })
  @RequirePermissions('institutions:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.institutionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create institutions' })
  @RequirePermissions('institutions:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.institutionsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update institutions' })
  @RequirePermissions('institutions:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.institutionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete institutions' })
  @RequirePermissions('institutions:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.institutionsService.remove(id);
  }
}
