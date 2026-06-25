import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HostelService } from '../services/hostel.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Hostel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('hostel')
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  @Get()
  @ApiOperation({ summary: 'List all hostel' })
  @RequirePermissions('hostel:read')
  findAll(@Query() query: PaginationDto) {
    return this.hostelService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hostel by ID' })
  @RequirePermissions('hostel:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hostelService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create hostel' })
  @RequirePermissions('hostel:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.hostelService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update hostel' })
  @RequirePermissions('hostel:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.hostelService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete hostel' })
  @RequirePermissions('hostel:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hostelService.remove(id);
  }
}
