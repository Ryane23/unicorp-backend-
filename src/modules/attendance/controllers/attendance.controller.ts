import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from '../services/attendance.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'List all attendance' })
  @RequirePermissions('attendance:read')
  findAll(@Query() query: PaginationDto) {
    return this.attendanceService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance by ID' })
  @RequirePermissions('attendance:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create attendance' })
  @RequirePermissions('attendance:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.attendanceService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update attendance' })
  @RequirePermissions('attendance:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.attendanceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attendance' })
  @RequirePermissions('attendance:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.attendanceService.remove(id);
  }
}
