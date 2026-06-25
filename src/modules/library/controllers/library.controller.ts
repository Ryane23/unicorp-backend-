import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LibraryService } from '../services/library.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Library')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  @ApiOperation({ summary: 'List all library' })
  @RequirePermissions('library:read')
  findAll(@Query() query: PaginationDto) {
    return this.libraryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get library by ID' })
  @RequirePermissions('library:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.libraryService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create library' })
  @RequirePermissions('library:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.libraryService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update library' })
  @RequirePermissions('library:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.libraryService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete library' })
  @RequirePermissions('library:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.libraryService.remove(id);
  }
}
