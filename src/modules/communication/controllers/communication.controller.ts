import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommunicationService } from '../services/communication.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Communication')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('communication')
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Get()
  @ApiOperation({ summary: 'List all communication' })
  @RequirePermissions('communication:read')
  findAll(@Query() query: PaginationDto) {
    return this.communicationService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get communication by ID' })
  @RequirePermissions('communication:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.communicationService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create communication' })
  @RequirePermissions('communication:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.communicationService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update communication' })
  @RequirePermissions('communication:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.communicationService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete communication' })
  @RequirePermissions('communication:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.communicationService.remove(id);
  }
}
