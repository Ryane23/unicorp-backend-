import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { CreateUsersDto, UpdateUsersDto } from '../dto/users.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @RequirePermissions('users.read')
  findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get users by ID' })
  @RequirePermissions('users.read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create users' })
  @RequirePermissions('users.create')
  create(@Body() dto: CreateUsersDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update users' })
  @RequirePermissions('users.update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUsersDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete users' })
  @RequirePermissions('users.delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
