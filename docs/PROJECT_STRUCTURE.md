# UniCore ERP - Project Structure

```
unicore-erp/
├── .github/workflows/ci.yml       # CI/CD pipeline
├── docker/
│   ├── Dockerfile                 # API production image
│   ├── Dockerfile.worker          # BullMQ worker image
│   ├── nginx/nginx.conf           # Reverse proxy + TLS
│   ├── postgres/init.sql          # DB extensions
│   └── prometheus/prometheus.yml  # Metrics scraping
├── docs/
│   ├── ARCHITECTURE.md            # System design
│   ├── DEPLOYMENT.md              # Cloud + on-prem deploy
│   └── DISASTER_RECOVERY.md       # Backup & DR plan
├── prisma/
│   ├── schema.prisma              # 460-table unified schema
│   ├── schemas/                   # Domain-split schema files
│   └── seed.ts                    # Demo tenant + admin seed
├── scripts/
│   ├── tables.json                # Table definitions (30 domains)
│   ├── generate-prisma-schema.ts  # Schema generator
│   └── generate-module-scaffold.js
├── src/
│   ├── main.ts                    # API bootstrap + Swagger
│   ├── app.module.ts              # Root module
│   ├── config/configuration.ts    # Env config
│   ├── common/
│   │   ├── common.module.ts
│   │   ├── context/tenant.context.ts
│   │   └── decorators/permissions.decorator.ts
│   ├── database/
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   ├── infrastructure/
│   │   ├── redis/                 # Session, OTP, cache
│   │   └── websocket/             # Socket.IO gateway
│   ├── events/
│   │   ├── domain.events.ts       # 7 domain events
│   │   └── listeners/domain-event.listener.ts
│   ├── queues/
│   │   ├── queues.module.ts       # BullMQ setup
│   │   ├── queue.constants.ts
│   │   ├── worker.main.ts
│   │   └── processors/
│   ├── middleware/tenant.middleware.ts
│   ├── guards/                    # JWT, RBAC, Tenant
│   ├── interceptors/              # Transform, logging, audit
│   ├── filters/global-exception.filter.ts
│   ├── shared/dto/pagination.dto.ts
│   └── modules/                   # 32 domain modules
│       ├── auth/                  # Fully implemented
│       ├── users/
│       ├── students/
│       ├── admissions/
│       ├── finance/
│       └── ... (28 more)
├── docker-compose.yml
├── docker-compose.prod.yml
├── package.json
└── README.md
```

Each module contains:
```
module/
├── controllers/    # REST endpoints
├── services/       # Business logic
├── repositories/   # Prisma data access
├── dto/            # Validation + Swagger
├── entities/       # Domain entities
├── interfaces/     # Contracts
├── events/         # Module events
├── listeners/      # Event handlers
└── module.ts
```
