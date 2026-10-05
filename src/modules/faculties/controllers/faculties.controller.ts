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
import { FacultiesService } from '../services/faculties.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { CurrentUser } from '@/common/decorators/permissions.decorator';
import { AuthUserPayload } from '@/modules/auth/services/auth.service';
import { CreateFacultiesDto, UpdateFacultiesDto } from '../dto/create-faculties.dto';

@ApiTags('Faculties')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'A valid access token is required.' })
@ApiForbiddenResponse({ description: 'The account lacks the required academic permission.' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Get()
  @ApiOperation({ summary: 'List all faculties' })
  @ApiOkResponse({ description: 'Paginated active faculties with department totals.' })
  @RequirePermissions('academic.read')
  findAll(@Query() query: PaginationDto) {
    return this.facultiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get faculties by ID' })
  @ApiOkResponse({ description: 'Faculty details and active department total.' })
  @ApiNotFoundResponse({ description: 'Faculty not found or archived.' })
  @RequirePermissions('academic.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.facultiesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create faculties' })
  @ApiCreatedResponse({ description: 'Faculty created and audit event recorded.' })
  @ApiConflictResponse({ description: 'A faculty with the same name or code already exists.' })
  @RequirePermissions('academic.manage')
  create(@Body() dto: CreateFacultiesDto, @CurrentUser() user: AuthUserPayload) {
    return this.facultiesService.create(dto, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update faculties' })
  @ApiOkResponse({ description: 'Faculty updated and audit event recorded.' })
  @ApiNotFoundResponse({ description: 'Faculty not found or archived.' })
  @ApiConflictResponse({ description: 'The new name or code already belongs to another faculty.' })
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
  @ApiOkResponse({ description: 'Faculty archived and audit event recorded.' })
  @ApiNotFoundResponse({ description: 'Faculty not found or already archived.' })
  @ApiBadRequestResponse({ description: 'Faculty still owns one or more active departments.' })
  @RequirePermissions('academic.manage')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.facultiesService.remove(id, user.sub);
  }
}
