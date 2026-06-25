# Deployment Guide

## Deployment Options

UniCore ERP supports:
- **Cloud** — AWS, GCP, Azure, DigitalOcean
- **On-Premise** — Docker Compose on bare metal or VM

## Prerequisites

- Docker 24+ and Docker Compose v2
- Node.js 20 LTS (for local development)
- PostgreSQL 16+
- Redis 7+
- SSL certificates (Let's Encrypt or commercial)

## Cloud Deployment (AWS Example)

### Architecture

```
                    ┌─────────────┐
                    │  Route 53   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │     ALB     │
                    └──────┬──────┘
              ┌────────────┼────────────┐
         ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
         │  API 1  │ │  API 2  │ │  API 3  │
         └────┬────┘ └────┬────┘ └────┬────┘
              └────────────┼────────────┘
                    ┌──────▼──────┐
              ┌─────┤  RDS Postgres│
              │     └─────────────┘
         ┌────▼────┐
         │ElastiCache│
         │  Redis   │
         └─────────┘
              ┌────▼────┐
              │  Worker  │
              │ (BullMQ) │
              └─────────┘
```

### Steps

1. **Provision RDS PostgreSQL 16**
   - Multi-AZ for production
   - Enable automated backups (7-day retention minimum)
   - Parameter group: `shared_preload_libraries = pg_stat_statements`

2. **Provision ElastiCache Redis 7**
   - Cluster mode for HA
   - Enable encryption in transit and at rest

3. **ECS/Fargate or EKS**
   ```bash
   docker build -f docker/Dockerfile -t unicore-erp:latest .
   docker push <ecr-repo>/unicore-erp:latest
   ```

4. **Environment Variables**
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/unicore_erp
   REDIS_HOST=elasticache-endpoint
   JWT_ACCESS_SECRET=<256-bit-secret>
   JWT_REFRESH_SECRET=<256-bit-secret>
   SENTRY_DSN=<sentry-dsn>
   ```

5. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

6. **Configure Monitoring**
   - Prometheus + Grafana (included in docker-compose)
   - Sentry for error tracking
   - CloudWatch alarms on CPU, memory, DB connections

## On-Premise Deployment

### Single-Server Setup

```bash
# Clone and configure
git clone <repo> && cd unicore-erp
cp .env.example .env
# Edit .env with production values

# Start full stack
docker compose up -d

# Run migrations
docker compose exec api npx prisma migrate deploy

# Seed initial data
docker compose exec api npm run prisma:seed
```

### Multi-Server Setup

| Server | Role | Services |
|--------|------|----------|
| Server 1 | App | API (3 replicas), Nginx |
| Server 2 | Worker | BullMQ workers (2 replicas) |
| Server 3 | Data | PostgreSQL (primary + replica) |
| Server 4 | Cache | Redis Sentinel cluster |

### Nginx SSL with Let's Encrypt

```bash
certbot certonly --nginx -d api.university.edu
cp /etc/letsencrypt/live/api.university.edu/fullchain.pem docker/nginx/ssl/
cp /etc/letsencrypt/live/api.university.edu/privkey.pem docker/nginx/ssl/
docker compose restart nginx
```

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. **Lint & Test** — on every push/PR
2. **Security Scan** — Trivy vulnerability scanner
3. **Build & Push** — Docker image to GHCR on main
4. **Deploy Staging** — automatic
5. **Deploy Production** — manual approval gate

## Performance Tuning

### PostgreSQL
```sql
-- Connection pooling via PgBouncer (recommended for 50K+ students)
max_connections = 200
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB
```

### Node.js API
```env
NODE_OPTIONS=--max-old-space-size=2048
```

### Redis
```
maxmemory 2gb
maxmemory-policy allkeys-lru
```

## Backup Strategy

See [DISASTER_RECOVERY.md](DISASTER_RECOVERY.md) for full backup and recovery procedures.

| Component | Frequency | Retention |
|-----------|-----------|-----------|
| PostgreSQL | Daily full + hourly WAL | 30 days |
| Redis | Daily RDB snapshot | 7 days |
| File uploads | Daily to S3/backup storage | 90 days |
| Config/secrets | On change (Vault) | Indefinite |

## Health Checks

- `GET /api/v1/health` — Database + Redis connectivity
- Docker healthcheck on API container
- ALB target group health checks
