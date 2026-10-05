# UniCore ERP Backend

Single-university ERP API built with NestJS, Prisma, PostgreSQL, JWT authentication, and database-backed RBAC.

## Requirements

- Node.js 22 (see `.nvmrc`)
- PostgreSQL 14+
- Redis 7 for shared production sessions; development can use the in-memory fallback

## Quick start

```bash
npm ci
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate:prod
npm run prisma:seed
npm run start:dev
```

- API: `http://localhost:4000/api/v1`
- Swagger: `http://localhost:4000/docs`
- OpenAPI JSON: `http://localhost:4000/docs-json`
- OpenAPI YAML: `http://localhost:4000/docs-yaml`
- Health: `http://localhost:4000/api/v1/health`

For the local in-memory session store, set `REDIS_ENABLED=false`. Production must set it to `true` and provide Redis connection settings.

## Active architecture

`prisma/schema.prisma` is the source of truth. It contains 42 connected models for:

- users, sessions, roles, and permissions;
- faculties, departments, programs, academic years, semesters, and levels;
- students, lecturers, administrators, and staff;
- courses, classes, enrollments, attendance, assessments, grades, and timetables;
- announcements, notifications, messages, and audit logs.

The older generated 460-model files under `prisma/schema.full.prisma` and `prisma/schemas/` are retained only as historical references. They are not used by Prisma or the running application.

UniCore currently represents one university. Requests do not use tenant IDs or `x-tenant-id` headers.

## Available endpoints

| Capability | Path |
| --- | --- |
| Authentication | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Students | `/api/v1/students` |
| Faculties | `/api/v1/faculties` |
| Departments | `/api/v1/departments` |
| Admin dashboard | `/api/v1/dashboards/admin` |
| Registrar dashboard | `/api/v1/dashboards/registrar` |
| HOD dashboard | `/api/v1/dashboards/hod` |
| Lecturer dashboard | `/api/v1/dashboards/lecturer` |
| Student dashboard | `/api/v1/dashboards/student` |
| Staff dashboard | `/api/v1/dashboards/staff` |

Dashboard routes enforce both role and permission requirements. HOD, lecturer, and student responses are scoped to the authenticated user's database profile.

## Development accounts

`npm run prisma:seed` creates demonstration accounts for every supported role. Their password comes from `DEMO_PASSWORD`; the development fallback is `ChangeMe123!`.

```text
superadmin@unicore.edu
admin@unicore.edu
registrar@unicore.edu
hod@unicore.edu
lecturer@unicore.edu
student@unicore.edu
staff@unicore.edu
```

Never use the fallback password in production.

### Seeded Admin dashboard

Run the migrations and seed, then sign in through the frontend:

```bash
npm run prisma:migrate:prod
npm run prisma:seed
```

| Item | Development value |
| --- | --- |
| Frontend login | `http://localhost:3000/#/login` |
| Admin dashboard | `http://localhost:3000/#/admin/dashboard` |
| Email | `admin@unicore.edu` |
| Password | `ChangeMe123!` or the value of `DEMO_PASSWORD` |

The seed is idempotent. It creates the Admin role and permissions plus the faculty, department, programme, student, lecturer, course, attendance, grade, timetable, and announcement records used by the Admin dashboard.

## Swagger workflow

1. Start the API and open `http://localhost:4000/docs`.
2. Expand **Authentication** and execute `POST /api/v1/auth/login` with the seeded Admin credentials.
3. Copy `data.accessToken` from the response.
4. Select **Authorize**, paste the token, and execute protected endpoints.

Swagger documents the currently mounted API modules only. The raw OpenAPI document is available at `/docs-json` for Postman, Insomnia, SDK generation, and automated contract checks.

## Database persistence proof

After running the seed, execute:

```bash
npm run test:db
```

The test performs a real PostgreSQL write/read cycle:

1. connects and runs `SELECT 1`;
2. inserts a uniquely named temporary faculty;
3. reads the exact row back and prints its ID, code, name, and timestamp;
4. verifies the seeded Admin role and dashboard source counts;
5. removes only the temporary probe record.

The command exits non-zero if persistence, seeded Admin access, or dashboard source data cannot be verified.

## Validation

```bash
npx prisma validate
npm run build
npm run test:db
npm run test:e2e -- --runInBand
```

## Docker

The API listens on port `4000`.

```bash
docker compose up -d postgres redis api
```

## Security notes

- Passwords use bcrypt with 12 rounds.
- Refresh and password-reset tokens are hashed before database storage.
- JWT access tokens carry database-derived roles and permissions.
- Role and permission guards run globally.
- Responses never select password hashes from user-management queries.

## Repositories

- Backend: [Ryane23/unicorp-backend-](https://github.com/Ryane23/unicorp-backend-)
- Frontend: [CarlTeclancing/unicore-frontend](https://github.com/CarlTeclancing/unicore-frontend)
