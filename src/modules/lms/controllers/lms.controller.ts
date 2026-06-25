import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LmsService } from '../services/lms.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Lms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('lms')
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  @Get()
  @ApiOperation({ summary: 'List all lms' })
  @RequirePermissions('lms:read')
  findAll(@Query() query: PaginationDto) {
    return this.lmsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lms by ID' })
  @RequirePermissions('lms:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lmsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create lms' })
  @RequirePermissions('lms:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.lmsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update lms' })
  @RequirePermissions('lms:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.lmsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lms' })
  @RequirePermissions('lms:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lmsService.remove(id);
  }
}
