import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TimetableService } from '../services/timetable.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Timetable')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get()
  @ApiOperation({ summary: 'List all timetable' })
  @RequirePermissions('timetable:read')
  findAll(@Query() query: PaginationDto) {
    return this.timetableService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get timetable by ID' })
  @RequirePermissions('timetable:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.timetableService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create timetable' })
  @RequirePermissions('timetable:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.timetableService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update timetable' })
  @RequirePermissions('timetable:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.timetableService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete timetable' })
  @RequirePermissions('timetable:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.timetableService.remove(id);
  }
}
