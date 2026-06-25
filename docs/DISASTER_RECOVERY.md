# Disaster Recovery Plan

## Recovery Objectives

| Metric | Target |
|--------|--------|
| RPO (Recovery Point Objective) | 1 hour |
| RTO (Recovery Time Objective) | 4 hours |

## Backup Procedures

### PostgreSQL

**Automated (Production)**
```bash
# Daily full backup via pg_dump (cron at 02:00 UTC)
pg_dump -Fc -h $DB_HOST -U unicore unicore_erp > /backups/unicore_$(date +%Y%m%d).dump

# Continuous WAL archiving to S3
archive_mode = on
archive_command = 'aws s3 cp %p s3://unicore-backups/wal/%f'
```

**Manual backup**
```bash
docker compose exec postgres pg_dump -U unicore -Fc unicore_erp > backup.dump
```

### Redis

```bash
# RDB snapshot (automatic with appendonly yes)
docker compose exec redis redis-cli BGSAVE
docker cp unicore-redis:/data/dump.rdb ./backups/redis_$(date +%Y%m%d).rdb
```

### Application State

- File uploads: sync to S3 with versioning enabled
- Secrets: stored in HashiCorp Vault / AWS Secrets Manager
- Configuration: version of infrastructure-as-code

## Recovery Procedures

### Scenario 1: Database Corruption

1. Stop API and worker services
2. Restore from latest clean backup:
   ```bash
   pg_restore -h $DB_HOST -U unicore -d unicore_erp --clean backup.dump
   ```
3. Apply WAL logs if point-in-time recovery needed:
   ```bash
   pg_restore --target-time="2026-06-19 14:30:00" ...
   ```
4. Run `npx prisma migrate deploy` to ensure schema is current
5. Restart services and verify health endpoint

### Scenario 2: Complete Server Failure

1. Provision replacement infrastructure (Terraform/CloudFormation)
2. Restore PostgreSQL from S3 backup
3. Restore Redis from RDB snapshot
4. Deploy latest Docker image from registry
5. Update DNS to point to new servers
6. Verify all health checks pass

### Scenario 3: Redis Failure

1. Redis Sentinel auto-promotes replica (if configured)
2. Manual fallback: restart Redis, sessions will require re-login
3. BullMQ queues: jobs in-flight may need retry (idempotent processors)

### Scenario 4: Data Breach

1. Rotate all JWT secrets immediately
2. Revoke all refresh tokens: `UPDATE refresh_tokens SET revoked = true`
3. Force password reset for all users
4. Review audit_logs for unauthorized access
5. Notify affected tenants per GDPR/compliance requirements

## Failover Architecture

```
Primary Region (Active)          DR Region (Standby)
┌─────────────────┐             ┌─────────────────┐
│  RDS Primary    │──replication──▶│  RDS Replica    │
│  ElastiCache    │──backup──────▶│  ElastiCache    │
│  ECS (3 tasks)  │             │  ECS (1 task)   │
└─────────────────┘             └─────────────────┘
         │                               │
         └──── Route 53 Failover ────────┘
```

## Testing Schedule

| Test | Frequency |
|------|-----------|
| Backup verification (restore to staging) | Weekly |
| Full DR drill | Quarterly |
| Failover test | Semi-annually |
| Security incident simulation | Annually |

## Monitoring & Alerting

Alerts configured for:
- Database connection failures
- Backup job failures
- Disk space > 80%
- API error rate > 1%
- Redis memory > 90%
- Queue depth > 10,000 jobs

Integration: Prometheus → Alertmanager → PagerDuty/Slack

## Contact Escalation

1. On-call engineer (PagerDuty)
2. Platform lead
3. CTO / Security officer
4. Tenant notification (if data affected)
