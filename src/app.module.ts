import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { QueuesModule } from './queues/queues.module';
import { WebSocketModule } from './infrastructure/websocket/websocket.module';
import { CommonModule } from './common/common.module';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { DomainEventListener } from './events/listeners/domain-event.listener';
import {
  NotificationProcessor,
  EmailProcessor,
  AuditProcessor,
  TranscriptProcessor,
  PayrollProcessor,
} from './queues/processors/notification.processor';

// Core Modules
import { AuthModule } from './modules/auth/auth.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { CampusesModule } from './modules/campuses/campuses.module';
import { FacultiesModule } from './modules/faculties/faculties.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { ProgrammesModule } from './modules/programmes/programmes.module';
import { AcademicYearsModule } from './modules/academic-years/academic-years.module';
import { SemestersModule } from './modules/semesters/semesters.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';

// Domain Modules
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { StudentsModule } from './modules/students/students.module';
import { CourseRegistrationModule } from './modules/course-registration/course-registration.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { ExaminationModule } from './modules/examination/examination.module';
import { ResultsModule } from './modules/results/results.module';
import { TranscriptsModule } from './modules/transcripts/transcripts.module';
import { FinanceModule } from './modules/finance/finance.module';
import { HrModule } from './modules/hr/hr.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { LibraryModule } from './modules/library/library.module';
import { HostelModule } from './modules/hostel/hostel.module';
import { LmsModule } from './modules/lms/lms.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { CoursesModule } from './modules/courses/courses.module';
import { HealthController } from './shared/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRootAsync({
      useFactory: () => ([{
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      }]),
    }),
    CommonModule,
    DatabaseModule,
    RedisModule,
    QueuesModule,
    WebSocketModule,
    AuthModule,
    AuthorizationModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    InstitutionsModule,
    CampusesModule,
    FacultiesModule,
    DepartmentsModule,
    ProgrammesModule,
    AcademicYearsModule,
    SemestersModule,
    NotificationsModule,
    AuditLogsModule,
    ReportsModule,
    SystemSettingsModule,
    AdmissionsModule,
    StudentsModule,
    CourseRegistrationModule,
    AttendanceModule,
    TimetableModule,
    ExaminationModule,
    ResultsModule,
    TranscriptsModule,
    FinanceModule,
    HrModule,
    PayrollModule,
    LibraryModule,
    HostelModule,
    LmsModule,
    CommunicationModule,
    CoursesModule,
  ],
  controllers: [HealthController],
  providers: [
    DomainEventListener,
    NotificationProcessor,
    EmailProcessor,
    AuditProcessor,
    TranscriptProcessor,
    PayrollProcessor,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
