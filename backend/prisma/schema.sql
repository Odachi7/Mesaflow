-- MesaFlow Complete Schema
-- Generated from Prisma Schema

-- Drop existing tables if they exist (for fresh start)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS cash_sessions CASCADE;
DROP TABLE IF EXISTS cash_registers CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS product_recipes CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- TENANTS
CREATE TABLE tenants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    plan_type TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    settings JSONB,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CUSTOMERS
CREATE TABLE customers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    cpf TEXT,
    notes TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX customers_tenant_phone_unique ON customers(tenant_id, phone);
CREATE UNIQUE INDEX customers_tenant_email_unique ON customers(tenant_id, email);
CREATE INDEX customers_tenant_idx ON customers(tenant_id);

-- USERS
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX users_tenant_email_unique ON users(tenant_id, email);
CREATE INDEX users_tenant_idx ON users(tenant_id);

-- TABLES
CREATE TABLE tables (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_number TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    qr_code TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX tables_tenant_number_unique ON tables(tenant_id, table_number);
CREATE INDEX tables_tenant_status_idx ON tables(tenant_id, status);

-- CATEGORIES
CREATE TABLE categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX categories_tenant_idx ON categories(tenant_id);

-- PRODUCTS
CREATE TABLE products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    image_url TEXT,
    preparation_time INTEGER,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX products_tenant_active_idx ON products(tenant_id, is_active);
CREATE INDEX products_category_idx ON products(category_id);

-- ORDERS
CREATE TABLE orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_id TEXT REFERENCES tables(id),
    order_number TEXT NOT NULL,
    waiter_id TEXT REFERENCES users(id),
    customer_id TEXT REFERENCES customers(id),
    customer_name TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    order_type TEXT,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    opened_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP(3)
);
CREATE UNIQUE INDEX orders_tenant_number_unique ON orders(tenant_id, order_number);
CREATE INDEX orders_tenant_status_idx ON orders(tenant_id, status);
CREATE INDEX orders_table_idx ON orders(table_id);
CREATE INDEX orders_customer_idx ON orders(customer_id);

-- ORDER ITEMS
CREATE TABLE order_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tenant_id TEXT NOT NULL,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX order_items_order_idx ON order_items(order_id);
CREATE INDEX order_items_tenant_idx ON order_items(tenant_id);

-- INVENTORY ITEMS
CREATE TABLE inventory_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit TEXT,
    current_quantity DECIMAL(10, 3) NOT NULL DEFAULT 0,
    min_quantity DECIMAL(10, 3),
    cost_per_unit DECIMAL(10, 2),
    last_restocked_at TIMESTAMP(3),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX inventory_items_tenant_idx ON inventory_items(tenant_id);

-- INVENTORY MOVEMENTS
CREATE TABLE inventory_movements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tenant_id TEXT NOT NULL,
    inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id),
    movement_type TEXT NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL,
    unit_cost DECIMAL(10, 2),
    reason TEXT,
    user_id TEXT REFERENCES users(id),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX inventory_movements_item_idx ON inventory_movements(inventory_item_id);

-- PRODUCT RECIPES
CREATE TABLE product_recipes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tenant_id TEXT NOT NULL,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id),
    quantity_needed DECIMAL(10, 3) NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- PAYMENTS
CREATE TABLE payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tenant_id TEXT NOT NULL,
    order_id TEXT NOT NULL REFERENCES orders(id),
    payment_method TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    cashier_id TEXT REFERENCES users(id),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX payments_order_idx ON payments(order_id);

-- CASH REGISTERS
CREATE TABLE cash_registers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CASH SESSIONS
CREATE TABLE cash_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tenant_id TEXT NOT NULL,
    cash_register_id TEXT NOT NULL REFERENCES cash_registers(id),
    cashier_id TEXT NOT NULL REFERENCES users(id),
    opening_balance DECIMAL(10, 2) NOT NULL,
    closing_balance DECIMAL(10, 2),
    expected_balance DECIMAL(10, 2),
    difference DECIMAL(10, 2),
    status TEXT NOT NULL DEFAULT 'open',
    opened_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP(3)
);

-- MESSAGES
CREATE TABLE messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES users(id),
    recipient_id TEXT REFERENCES users(id),
    message TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'chat',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX messages_recipient_read_idx ON messages(recipient_id, is_read);

-- Prisma migrations table
CREATE TABLE IF NOT EXISTS _prisma_migrations (
    id VARCHAR(36) PRIMARY KEY,
    checksum VARCHAR(64) NOT NULL,
    finished_at TIMESTAMP(3),
    migration_name VARCHAR(255) NOT NULL,
    logs TEXT,
    rolled_back_at TIMESTAMP(3),
    started_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_steps_count INTEGER NOT NULL DEFAULT 0
);

-- Insert initial migration record
INSERT INTO _prisma_migrations (id, checksum, migration_name, finished_at, applied_steps_count)
VALUES (
    gen_random_uuid()::TEXT,
    'manual_init_schema',
    '20260120000000_init',
    CURRENT_TIMESTAMP,
    1
);

SELECT 'Schema created successfully!' AS result;
