import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DepartmentsService } from '../services/departments.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { CurrentUser } from '@/common/decorators/permissions.decorator';
import { AuthUserPayload } from '@/modules/auth/services/auth.service';
import { CreateDepartmentsDto, UpdateDepartmentsDto } from '../dto/create-departments.dto';

@ApiTags('Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all departments' })
  @RequirePermissions('academic.read')
  findAll(@Query() query: PaginationDto) {
    return this.departmentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get departments by ID' })
  @RequirePermissions('academic.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create departments' })
  @RequirePermissions('academic.manage')
  create(@Body() dto: CreateDepartmentsDto, @CurrentUser() user: AuthUserPayload) {
    return this.departmentsService.create(dto, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update departments' })
  @RequirePermissions('academic.manage')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentsDto,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.departmentsService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a department' })
  @RequirePermissions('academic.manage')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.departmentsService.remove(id, user.sub);
  }
}
