-- Execute this via docker exec
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    plan_type TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    settings JSONB,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Test tenant
INSERT INTO tenants (id, name, subdomain, plan_type) 
VALUES ('test-tenant-123', 'Test Restaurant', 'test', 'basic')
ON CONFLICT DO NOTHING;
