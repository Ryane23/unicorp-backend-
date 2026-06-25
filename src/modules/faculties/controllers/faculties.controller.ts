import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FacultiesService } from '../services/faculties.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Faculties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Get()
  @ApiOperation({ summary: 'List all faculties' })
  @RequirePermissions('faculties:read')
  findAll(@Query() query: PaginationDto) {
    return this.facultiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get faculties by ID' })
  @RequirePermissions('faculties:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.facultiesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create faculties' })
  @RequirePermissions('faculties:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.facultiesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update faculties' })
  @RequirePermissions('faculties:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.facultiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete faculties' })
  @RequirePermissions('faculties:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.facultiesService.remove(id);
  }
}
