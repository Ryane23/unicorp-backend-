import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CampusesService } from '../services/campuses.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Campuses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('campuses')
export class CampusesController {
  constructor(private readonly campusesService: CampusesService) {}

  @Get()
  @ApiOperation({ summary: 'List all campuses' })
  @RequirePermissions('campuses:read')
  findAll(@Query() query: PaginationDto) {
    return this.campusesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campuses by ID' })
  @RequirePermissions('campuses:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.campusesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create campuses' })
  @RequirePermissions('campuses:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.campusesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update campuses' })
  @RequirePermissions('campuses:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.campusesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete campuses' })
  @RequirePermissions('campuses:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.campusesService.remove(id);
  }
}
