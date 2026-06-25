import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdmissionsService } from '../services/admissions.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Admissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all admissions' })
  @RequirePermissions('admissions:read')
  findAll(@Query() query: PaginationDto) {
    return this.admissionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admissions by ID' })
  @RequirePermissions('admissions:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.admissionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create admissions' })
  @RequirePermissions('admissions:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.admissionsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update admissions' })
  @RequirePermissions('admissions:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.admissionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete admissions' })
  @RequirePermissions('admissions:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.admissionsService.remove(id);
  }
}
