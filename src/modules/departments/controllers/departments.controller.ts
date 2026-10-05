import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DepartmentsService } from '../services/departments.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { CurrentUser } from '@/common/decorators/permissions.decorator';
import { AuthUserPayload } from '@/modules/auth/services/auth.service';
import { CreateDepartmentsDto, UpdateDepartmentsDto } from '../dto/create-departments.dto';

@ApiTags('Departments')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'A valid access token is required.' })
@ApiForbiddenResponse({ description: 'The account lacks the required academic permission.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all departments' })
  @ApiOkResponse({ description: 'Paginated active departments with faculty and usage totals.' })
  @RequirePermissions('academic.read')
  findAll(@Query() query: PaginationDto) {
    return this.departmentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get departments by ID' })
  @ApiOkResponse({ description: 'Department, parent faculty, and active usage totals.' })
  @ApiNotFoundResponse({ description: 'Department not found or archived.' })
  @RequirePermissions('academic.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create departments' })
  @ApiCreatedResponse({ description: 'Department created and audit event recorded.' })
  @ApiBadRequestResponse({ description: 'Selected faculty does not exist or is archived.' })
  @ApiConflictResponse({ description: 'A department with the same name or code already exists.' })
  @RequirePermissions('academic.manage')
  create(@Body() dto: CreateDepartmentsDto, @CurrentUser() user: AuthUserPayload) {
    return this.departmentsService.create(dto, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update departments' })
  @ApiOkResponse({ description: 'Department updated and audit event recorded.' })
  @ApiNotFoundResponse({ description: 'Department not found or archived.' })
  @ApiBadRequestResponse({ description: 'Selected faculty does not exist or is archived.' })
  @ApiConflictResponse({ description: 'The new name or code already belongs to another department.' })
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
  @ApiOkResponse({ description: 'Department archived and audit event recorded.' })
  @ApiNotFoundResponse({ description: 'Department not found or already archived.' })
  @ApiBadRequestResponse({ description: 'Department still has active programmes, lecturers, or courses.' })
  @RequirePermissions('academic.manage')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.departmentsService.remove(id, user.sub);
  }
}
