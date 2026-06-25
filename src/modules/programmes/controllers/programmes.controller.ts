import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProgrammesService } from '../services/programmes.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Programmes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('programmes')
export class ProgrammesController {
  constructor(private readonly programmesService: ProgrammesService) {}

  @Get()
  @ApiOperation({ summary: 'List all programmes' })
  @RequirePermissions('programmes:read')
  findAll(@Query() query: PaginationDto) {
    return this.programmesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get programmes by ID' })
  @RequirePermissions('programmes:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.programmesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create programmes' })
  @RequirePermissions('programmes:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.programmesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update programmes' })
  @RequirePermissions('programmes:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.programmesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete programmes' })
  @RequirePermissions('programmes:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.programmesService.remove(id);
  }
}
