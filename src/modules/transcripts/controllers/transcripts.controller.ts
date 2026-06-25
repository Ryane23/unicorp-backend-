import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TranscriptsService } from '../services/transcripts.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Transcripts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('transcripts')
export class TranscriptsController {
  constructor(private readonly transcriptsService: TranscriptsService) {}

  @Get()
  @ApiOperation({ summary: 'List all transcripts' })
  @RequirePermissions('transcripts:read')
  findAll(@Query() query: PaginationDto) {
    return this.transcriptsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transcripts by ID' })
  @RequirePermissions('transcripts:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transcriptsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create transcripts' })
  @RequirePermissions('transcripts:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.transcriptsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update transcripts' })
  @RequirePermissions('transcripts:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.transcriptsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transcripts' })
  @RequirePermissions('transcripts:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.transcriptsService.remove(id);
  }
}
