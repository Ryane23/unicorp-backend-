import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SystemSettingsService } from '../services/system-settings.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('SystemSettings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'List all system settings' })
  @RequirePermissions('system-settings:read')
  findAll(@Query() query: PaginationDto) {
    return this.systemSettingsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get system settings by ID' })
  @RequirePermissions('system-settings:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.systemSettingsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create system settings' })
  @RequirePermissions('system-settings:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.systemSettingsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update system settings' })
  @RequirePermissions('system-settings:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.systemSettingsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete system settings' })
  @RequirePermissions('system-settings:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.systemSettingsService.remove(id);
  }
}
