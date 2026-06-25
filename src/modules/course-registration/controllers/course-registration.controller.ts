import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CourseRegistrationService } from '../services/course-registration.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('CourseRegistration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('registrations')
export class CourseRegistrationController {
  constructor(private readonly courseRegistrationService: CourseRegistrationService) {}

  @Get()
  @ApiOperation({ summary: 'List all course registration' })
  @RequirePermissions('course-registration:read')
  findAll(@Query() query: PaginationDto) {
    return this.courseRegistrationService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course registration by ID' })
  @RequirePermissions('course-registration:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.courseRegistrationService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create course registration' })
  @RequirePermissions('course-registration:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.courseRegistrationService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update course registration' })
  @RequirePermissions('course-registration:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.courseRegistrationService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course registration' })
  @RequirePermissions('course-registration:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.courseRegistrationService.remove(id);
  }
}
