# UniCore ERP

Production-ready University Enterprise Resource Planning backend built with NestJS, PostgreSQL, Prisma, Redis, and BullMQ.

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client (460 models)
npx prisma generate

# Start infrastructure
docker compose up -d postgres redis

# Run migrations
npx prisma migrate dev

# Seed database
npm run prisma:seed

# Start API (development)
npm run start:dev

# Start BullMQ worker
npm run start:worker
```

- **API**: http://localhost:3000/api/v1
- **Swagger**: http://localhost:3000/docs

## Architecture

```
src/
├── modules/          # 32 domain modules (Clean Architecture)
├── common/           # Shared context, decorators
├── infrastructure/   # Redis, WebSocket
├── database/         # Prisma service
├── config/           # Environment configuration
├── events/           # Domain events + listeners
├── queues/           # BullMQ processors
├── middleware/       # Tenant isolation
├── guards/           # JWT, RBAC, Tenant
├── interceptors/     # Transform, logging, audit
├── filters/          # Global exception handling
└── shared/           # DTOs, health checks
```

Each module follows:

```
module/
├── controllers/
├── services/
├── repositories/
├── dto/
├── entities/
├── interfaces/
├── events/
└── module.ts
```

## Database

- **460 tables** across 30 schema domains
- Multi-tenant with `tenant_id` on every business table
- Soft deletes via `deleted_at`
- Audit fields: `created_by`, `updated_by`, `created_at`, `updated_at`

Regenerate schema from definitions:

```bash
node scripts/generate-prisma-schema.ts
```

## API Endpoints

| Module | Base Path |
|--------|-----------|
| Auth | `/api/v1/auth` |
| Users | `/api/v1/users` |
| Students | `/api/v1/students` |
| Admissions | `/api/v1/admissions` |
| Courses | `/api/v1/courses` |
| Results | `/api/v1/results` |
| Finance | `/api/v1/finance` |
| Library | `/api/v1/library` |
| Hostel | `/api/v1/hostel` |
| Payroll | `/api/v1/payroll` |
| Reports | `/api/v1/reports` |

All requests require `Authorization: Bearer <token>` and `x-tenant-id` header.

## Security

- JWT access + refresh tokens
- BCrypt password hashing (12 rounds)
- RBAC with role inheritance
- 2FA (TOTP via otplib)
- Rate limiting (Throttler)
- Helmet, CORS, CSRF-ready
- Redis session store
- Global audit logging

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for cloud and on-premise deployment.

```bash
docker compose up -d          # Full stack (dev)
docker compose -f docker-compose.prod.yml up -d  # Production
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Disaster Recovery](docs/DISASTER_RECOVERY.md)
- [API Reference](http://localhost:3000/docs) (Swagger)

## License

Proprietary - UniCore Team
