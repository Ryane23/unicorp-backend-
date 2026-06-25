import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AcademicYearsService } from '../services/academic-years.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('AcademicYears')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Get()
  @ApiOperation({ summary: 'List all academic years' })
  @RequirePermissions('academic-years:read')
  findAll(@Query() query: PaginationDto) {
    return this.academicYearsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get academic years by ID' })
  @RequirePermissions('academic-years:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicYearsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create academic years' })
  @RequirePermissions('academic-years:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.academicYearsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update academic years' })
  @RequirePermissions('academic-years:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.academicYearsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete academic years' })
  @RequirePermissions('academic-years:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicYearsService.remove(id);
  }
}
