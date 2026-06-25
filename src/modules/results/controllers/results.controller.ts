import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ResultsService } from '../services/results.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Results')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  @ApiOperation({ summary: 'List all results' })
  @RequirePermissions('results:read')
  findAll(@Query() query: PaginationDto) {
    return this.resultsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get results by ID' })
  @RequirePermissions('results:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.resultsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create results' })
  @RequirePermissions('results:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.resultsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update results' })
  @RequirePermissions('results:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.resultsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete results' })
  @RequirePermissions('results:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.resultsService.remove(id);
  }
}
