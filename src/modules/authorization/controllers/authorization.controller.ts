import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthorizationService } from '../services/authorization.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Authorization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('authorization')
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @Get()
  @ApiOperation({ summary: 'List all authorization' })
  @RequirePermissions('authorization:read')
  findAll(@Query() query: PaginationDto) {
    return this.authorizationService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get authorization by ID' })
  @RequirePermissions('authorization:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.authorizationService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create authorization' })
  @RequirePermissions('authorization:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.authorizationService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update authorization' })
  @RequirePermissions('authorization:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.authorizationService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete authorization' })
  @RequirePermissions('authorization:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.authorizationService.remove(id);
  }
}
