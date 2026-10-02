import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FacultiesService } from '../services/faculties.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { CurrentUser } from '@/common/decorators/permissions.decorator';
import { AuthUserPayload } from '@/modules/auth/services/auth.service';
import { CreateFacultiesDto, UpdateFacultiesDto } from '../dto/create-faculties.dto';

@ApiTags('Faculties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Get()
  @ApiOperation({ summary: 'List all faculties' })
  @RequirePermissions('academic.read')
  findAll(@Query() query: PaginationDto) {
    return this.facultiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get faculties by ID' })
  @RequirePermissions('academic.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.facultiesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create faculties' })
  @RequirePermissions('academic.manage')
  create(@Body() dto: CreateFacultiesDto, @CurrentUser() user: AuthUserPayload) {
    return this.facultiesService.create(dto, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update faculties' })
  @RequirePermissions('academic.manage')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFacultiesDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.facultiesService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a faculty' })
  @RequirePermissions('academic.manage')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.facultiesService.remove(id, user.sub);
  }
}
