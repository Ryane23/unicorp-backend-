import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  RequirePermissions,
  RequireRoles,
} from '@/common/decorators/permissions.decorator';
import { AuthUserPayload } from '@/modules/auth/services/auth.service';
import { DashboardsService } from './dashboards.service';

@ApiTags('Dashboards')
@ApiBearerAuth()
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboards: DashboardsService) {}

  @Get('admin')
  @RequireRoles('SUPER_ADMIN', 'ADMIN')
  @RequirePermissions('dashboard.admin.read')
  @ApiOperation({ summary: 'University-wide administrator dashboard' })
  admin() {
    return this.dashboards.admin();
  }

  @Get('registrar')
  @RequireRoles('REGISTRAR')
  @RequirePermissions('dashboard.registrar.read')
  @ApiOperation({ summary: 'Registrar academic-records dashboard' })
  registrar() {
    return this.dashboards.registrar();
  }

  @Get('hod')
  @RequireRoles('HOD')
  @RequirePermissions('dashboard.hod.read')
  @ApiOperation({ summary: 'Department-scoped head-of-department dashboard' })
  hod(@CurrentUser() user: AuthUserPayload) {
    return this.dashboards.hod(user.sub);
  }

  @Get('lecturer')
  @RequireRoles('LECTURER')
  @RequirePermissions('dashboard.lecturer.read')
  @ApiOperation({ summary: 'Lecturer teaching dashboard' })
  lecturer(@CurrentUser() user: AuthUserPayload) {
    return this.dashboards.lecturer(user.sub);
  }

  @Get('student')
  @RequireRoles('STUDENT')
  @RequirePermissions('dashboard.student.read')
  @ApiOperation({ summary: 'Student personal academic dashboard' })
  student(@CurrentUser() user: AuthUserPayload) {
    return this.dashboards.student(user.sub);
  }

  @Get('staff')
  @RequireRoles('STAFF')
  @RequirePermissions('dashboard.staff.read')
  @ApiOperation({ summary: 'General staff dashboard' })
  staff(@CurrentUser() user: AuthUserPayload) {
    return this.dashboards.staff(user.sub);
  }
}
