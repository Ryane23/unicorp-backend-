# UniCore ERP Architecture

## Overview

UniCore ERP is a multi-tenant university management platform designed to scale to 50,000+ active students per tenant, supporting both cloud and on-premise deployments.

## Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  Controllers │ Guards │ Interceptors │ WebSocket Gateway │
├─────────────────────────────────────────────────────────┤
│                    Application Layer                     │
│  Services │ DTOs │ Event Listeners │ Queue Processors    │
├─────────────────────────────────────────────────────────┤
│                      Domain Layer                        │
│  Entities │ Interfaces │ Domain Events                   │
├─────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                   │
│  Repositories │ Prisma │ Redis │ BullMQ │ External APIs  │
└─────────────────────────────────────────────────────────┘
```

## Multi-Tenancy

Every business table includes:

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `tenant_id` | UUID | Tenant isolation |
| `created_by` | UUID | Audit |
| `updated_by` | UUID | Audit |
| `created_at` | Timestamp | Audit |
| `updated_at` | Timestamp | Audit |
| `deleted_at` | Timestamp | Soft delete |

**Tenant isolation** is enforced via:
1. `TenantMiddleware` — extracts tenant from JWT or `x-tenant-id` header
2. `TenantContext` — request-scoped tenant ID available to all services
3. Repository layer — all queries filter by `tenantId`
4. Guards — reject requests without valid tenant context

## Module Map (32 Modules)

### Core
- **auth** — Login, logout, refresh, 2FA, sessions, password reset
- **authorization** — Policy evaluation
- **users** — User management
- **roles** / **permissions** — RBAC with inheritance
- **institutions** / **campuses** / **faculties** / **departments** / **programmes**
- **academic-years** / **semesters**
- **notifications** / **audit-logs** / **reports** / **system-settings**

### Academic Operations
- **admissions** — Online applications, document uploads, approval workflow
- **students** — Records, transfers, withdrawals, graduation
- **courses** — Course catalog, prerequisites, offerings
- **course-registration** — Add/drop, credit validation, advisor approval
- **attendance** — Manual, QR, biometric
- **timetable** — Scheduling, conflict detection
- **examination** — Exam scheduling, seating, invigilation
- **results** — GPA/CGPA, moderation, approval workflow
- **transcripts** — PDF generation, QR verification

### Administrative
- **finance** — Fees, invoices, MTN MoMo, Orange Money, Stripe, PayPal
- **hr** — Employees, leave, performance reviews
- **payroll** — Salary processing, payslips
- **library** — Catalog, borrowing, fines
- **hostel** — Allocation, occupancy
- **lms** — Materials, assignments, quizzes, forums
- **communication** — Email, SMS, push, bulk messaging

## Event-Driven Architecture

```
Domain Event → EventEmitter2 → Listener → BullMQ Queue → Processor
```

| Event | Queue Action |
|-------|-------------|
| `StudentCreatedEvent` | Welcome email notification |
| `AdmissionApprovedEvent` | Generate admission letter |
| `CourseRegisteredEvent` | Audit log |
| `ResultPublishedEvent` | Notify students |
| `PaymentCompletedEvent` | Send receipt |
| `TranscriptGeneratedEvent` | Generate PDF |
| `PayrollProcessedEvent` | Generate payslips |

## Database Schema (460 Tables)

Organized into 30 Prisma schema files under `prisma/schemas/`:

| Domain | Tables | Key Entities |
|--------|--------|-------------|
| tenant | 15 | tenants, institutions, campuses |
| auth | 16 | users, sessions, refresh_tokens |
| rbac | 10 | roles, permissions, user_roles |
| academic | 20 | courses, offerings, lecture_halls |
| admissions | 20 | applications, applicants |
| students | 25 | students, guardians |
| registration | 15 | registrations, approvals |
| attendance | 12 | sessions, records, biometric |
| timetable | 14 | schedules, room_allocations |
| examination | 15 | exams, invigilators |
| results | 20 | results, grade_scales |
| transcripts | 10 | transcripts, verifications |
| finance | 33 | invoices, payments, scholarships |
| hr | 26 | employees, leave_requests |
| payroll | 17 | payrolls, payslips |
| library | 21 | books, borrowings |
| hostel | 15 | hostels, allocations |
| lms | 26 | assignments, quizzes |
| communication | 16 | announcements, emails |
| audit | 10 | audit_logs, activity_logs |
| settings | 15 | system_settings, feature_flags |
| reports | 10 | report_definitions |
| assets | 10 | assets, maintenance |
| research | 10 | research_projects |
| events | 10 | events, registrations |
| transport | 10 | vehicles, routes |
| health | 10 | health_records |
| cafeteria | 10 | menu_items, orders |
| inventory | 10 | inventory_items |
| documents | 10 | documents, workflows |

## Repository Pattern

```typescript
@Injectable()
export class StudentsRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, query: PaginationDto) {
    const where = { tenantId, deletedAt: null };
    // ... paginated query
  }
}
```

## Redis Usage

| Purpose | Key Pattern | TTL |
|---------|------------|-----|
| Sessions | `session:{id}` | 7 days |
| OTP | `otp:{purpose}:{id}` | 5 min |
| Cache | `cache:{key}` | 1 hour |
| Rate limiting | Built into Throttler | 60s |

## Scaling Strategy

| Approach |
|--------|----------|
| API | Horizontal scaling behind Nginx (3+ replicas) |
| Workers | Separate BullMQ worker containers |
| Database | PostgreSQL read replicas, connection pooling (PgBouncer) |
| Cache | Redis Cluster |
| Files | S3-compatible object storage |
| 50K students | Partitioned indexes on `tenant_id`, cursor pagination |

## Security Architecture

```
Request → Nginx (TLS, rate limit) → Helmet → Throttler → JWT Guard
  → Tenant Middleware → Permissions Guard → Controller → Audit Interceptor
```
