import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  CurrentUser,
  RequirePermissions,
  RequireRoles,
} from '@/common/decorators/permissions.decorator';
import { AuthUserPayload } from '@/modules/auth/services/auth.service';
import { DashboardsService } from './dashboards.service';

@ApiTags('Dashboards')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({ description: 'A valid access token is required.' })
@ApiForbiddenResponse({ description: 'The account does not have access to this role dashboard.' })
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboards: DashboardsService) {}

  @Get('admin')
  @RequireRoles('SUPER_ADMIN', 'ADMIN')
  @RequirePermissions('dashboard.admin.read')
  @ApiOperation({ summary: 'University-wide administrator dashboard' })
  @ApiOkResponse({ description: 'University totals, academic period, attendance, performance, and announcements.' })
  admin() {
    return this.dashboards.admin();
  }

  @Get('registrar')
  @RequireRoles('REGISTRAR')
  @RequirePermissions('dashboard.registrar.read')
  @ApiOperation({ summary: 'Registrar academic-records dashboard' })
  @ApiOkResponse({ description: 'Student, enrollment, programme, calendar, and announcement summaries.' })
  registrar() {
    return this.dashboards.registrar();
  }

  @Get('hod')
  @RequireRoles('HOD')
  @RequirePermissions('dashboard.hod.read')
  @ApiOperation({ summary: 'Department-scoped head-of-department dashboard' })
  @ApiOkResponse({ description: 'Department-scoped people, course, result, and performance metrics.' })
  @ApiNotFoundResponse({ description: 'The authenticated HOD has no lecturer profile.' })
  hod(@CurrentUser() user: AuthUserPayload) {
    return this.dashboards.hod(user.sub);
  }

  @Get('lecturer')
  @RequireRoles('LECTURER')
  @RequirePermissions('dashboard.lecturer.read')
  @ApiOperation({ summary: 'Lecturer teaching dashboard' })
  @ApiOkResponse({ description: 'Assigned offerings, enrollment totals, grade tasks, and timetable.' })
  @ApiNotFoundResponse({ description: 'The authenticated lecturer has no lecturer profile.' })
  lecturer(@CurrentUser() user: AuthUserPayload) {
    return this.dashboards.lecturer(user.sub);
  }

  @Get('student')
  @RequireRoles('STUDENT')
  @RequirePermissions('dashboard.student.read')
  @ApiOperation({ summary: 'Student personal academic dashboard' })
  @ApiOkResponse({ description: 'Personal profile, courses, attendance, grades, timetable, and notices.' })
  @ApiNotFoundResponse({ description: 'The authenticated student has no student profile.' })
  student(@CurrentUser() user: AuthUserPayload) {
    return this.dashboards.student(user.sub);
  }

  @Get('staff')
  @RequireRoles('STAFF')
  @RequirePermissions('dashboard.staff.read')
  @ApiOperation({ summary: 'General staff dashboard' })
  @ApiOkResponse({ description: 'Staff profile, notifications, and announcements.' })
  @ApiNotFoundResponse({ description: 'The authenticated staff account does not exist.' })
  staff(@CurrentUser() user: AuthUserPayload) {
    return this.dashboards.staff(user.sub);
  }
}
