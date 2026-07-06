-- UniCore ERP PostgreSQL initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Standard configuration for ERP production
ALTER DATABASE unicore_erp SET timezone TO 'UTC';
