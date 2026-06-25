-- UniCore ERP PostgreSQL initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Row-level security helper (applied per-tenant in application layer via Prisma middleware)
-- Performance indexes for multi-tenant queries
-- Additional indexes are created via Prisma migrations

ALTER DATABASE unicore_erp SET timezone TO 'UTC';
