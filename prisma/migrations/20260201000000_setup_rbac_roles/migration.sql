-- Create roles (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_readonly') THEN
        CREATE ROLE app_readonly WITH LOGIN PASSWORD 'CHANGE_ME_READONLY';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_readwrite') THEN
        CREATE ROLE app_readwrite WITH LOGIN PASSWORD 'CHANGE_ME_READWRITE';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_admin') THEN
        CREATE ROLE app_admin WITH LOGIN PASSWORD 'CHANGE_ME_ADMIN';
    END IF;
END $$;

-- Schema privileges
GRANT USAGE ON SCHEMA public TO app_readonly, app_readwrite;
GRANT USAGE, CREATE ON SCHEMA public TO app_admin;

-- Table privileges
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_readwrite;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_admin;

-- Sequence privileges (required for SERIAL/autoincrement)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_readwrite;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- Default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO app_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO app_admin;

-- Default privileges for future sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO app_admin;

-- Enum type privileges
GRANT USAGE ON TYPE "MessageStatus" TO app_readonly, app_readwrite, app_admin;
