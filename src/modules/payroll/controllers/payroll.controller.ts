import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PayrollService } from '../services/payroll.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/guards/permissions.guard';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { PaginationDto } from '@/shared/dto/pagination.dto';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get()
  @ApiOperation({ summary: 'List all payroll' })
  @RequirePermissions('payroll:read')
  findAll(@Query() query: PaginationDto) {
    return this.payrollService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll by ID' })
  @RequirePermissions('payroll:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create payroll' })
  @RequirePermissions('payroll:create')
  create(@Body() dto: Record<string, unknown>) {
    return this.payrollService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update payroll' })
  @RequirePermissions('payroll:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Record<string, unknown>) {
    return this.payrollService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payroll' })
  @RequirePermissions('payroll:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.remove(id);
  }
}
