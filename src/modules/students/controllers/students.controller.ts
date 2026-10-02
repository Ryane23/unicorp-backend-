import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { StudentsService } from '../services/students.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { CreateStudentsDto, UpdateStudentsDto } from '../dto/create-students.dto';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all students' })
  @RequirePermissions('students.read')
  findAll(@Query() query: PaginationDto) {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get students by ID' })
  @RequirePermissions('students.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create students' })
  @RequirePermissions('students.create')
  create(@Body() dto: CreateStudentsDto) {
    return this.studentsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update students' })
  @RequirePermissions('students.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStudentsDto) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete students' })
  @RequirePermissions('students.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.remove(id);
  }
}
