import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SemestersService } from '../services/semesters.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Semesters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('semesters')
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Get()
  @ApiOperation({ summary: 'List all semesters' })
  @RequirePermissions('semesters:read')
  findAll(@Query() query: PaginationDto) {
    return this.semestersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get semesters by ID' })
  @RequirePermissions('semesters:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.semestersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create semesters' })
  @RequirePermissions('semesters:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.semestersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update semesters' })
  @RequirePermissions('semesters:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.semestersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete semesters' })
  @RequirePermissions('semesters:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.semestersService.remove(id);
  }
}
