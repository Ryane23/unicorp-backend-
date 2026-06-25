import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExaminationService } from '../services/examination.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Examination')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('examinations')
export class ExaminationController {
  constructor(private readonly examinationService: ExaminationService) {}

  @Get()
  @ApiOperation({ summary: 'List all examination' })
  @RequirePermissions('examination:read')
  findAll(@Query() query: PaginationDto) {
    return this.examinationService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get examination by ID' })
  @RequirePermissions('examination:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.examinationService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create examination' })
  @RequirePermissions('examination:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.examinationService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update examination' })
  @RequirePermissions('examination:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.examinationService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete examination' })
  @RequirePermissions('examination:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.examinationService.remove(id);
  }
}
