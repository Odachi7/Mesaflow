-- Seed Script for MesaFlow
-- Insert Tenant
INSERT INTO tenants (id, name, subdomain, plan_type, is_active, settings)
VALUES (
    'demo-tenant-001',
    'Restaurante Demo',
    'demo',
    'premium',
    true,
    '{"serviceTax": 10, "currency": "BRL", "timezone": "America/Sao_Paulo"}'
) ON CONFLICT (subdomain) DO NOTHING;

-- Insert Admin User (senha: admin123 - hash bcrypt)
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
VALUES (
    'demo-admin-001',
    'demo-tenant-001',
    'admin@demo.com',
    '$2b$10$K8YGbGCdKZbX0g7L8J0qQu4Yk7XD0IhJ8h8Wl2B6U7d4nM3rP9xKa',
    'Administrador',
    'admin',
    true
) ON CONFLICT DO NOTHING;

-- Insert Waiter User
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
VALUES (
    'demo-waiter-001',
    'demo-tenant-001',
    'garcom@demo.com',
    '$2b$10$K8YGbGCdKZbX0g7L8J0qQu4Yk7XD0IhJ8h8Wl2B6U7d4nM3rP9xKa',
    'João Garçom',
    'waiter',
    true
) ON CONFLICT DO NOTHING;

-- Insert Categories
INSERT INTO categories (id, tenant_id, name, description, display_order, is_active) VALUES
('cat-001', 'demo-tenant-001', 'Bebidas', 'Bebidas geladas e quentes', 1, true),
('cat-002', 'demo-tenant-001', 'Entradas', 'Petiscos e aperitivos', 2, true),
('cat-003', 'demo-tenant-001', 'Pratos Principais', 'Pratos do dia e especialidades', 3, true),
('cat-004', 'demo-tenant-001', 'Sobremesas', 'Doces e sobremesas', 4, true),
('cat-005', 'demo-tenant-001', 'Porções', 'Porções para compartilhar', 5, true)
ON CONFLICT DO NOTHING;

-- Insert Tables
INSERT INTO tables (id, tenant_id, table_number, capacity, status) VALUES
('table-001', 'demo-tenant-001', '1', 4, 'available'),
('table-002', 'demo-tenant-001', '2', 4, 'available'),
('table-003', 'demo-tenant-001', '3', 4, 'available'),
('table-004', 'demo-tenant-001', '4', 4, 'available'),
('table-005', 'demo-tenant-001', '5', 4, 'available'),
('table-006', 'demo-tenant-001', '6', 6, 'available'),
('table-007', 'demo-tenant-001', '7', 6, 'available'),
('table-008', 'demo-tenant-001', '8', 6, 'available'),
('table-009', 'demo-tenant-001', '9', 6, 'available'),
('table-010', 'demo-tenant-001', '10', 6, 'available')
ON CONFLICT DO NOTHING;

-- Insert Products
INSERT INTO products (id, tenant_id, category_id, name, description, price, is_available, is_active) VALUES
('prod-001', 'demo-tenant-001', 'cat-001', 'Coca-Cola 350ml', 'Refrigerante Coca-Cola lata', 6.00, true, true),
('prod-002', 'demo-tenant-001', 'cat-001', 'Água Mineral 500ml', 'Água mineral sem gás', 4.00, true, true),
('prod-003', 'demo-tenant-001', 'cat-001', 'Suco Natural', 'Suco de laranja, limão ou maracujá', 8.00, true, true),
('prod-004', 'demo-tenant-001', 'cat-001', 'Cerveja Heineken 600ml', 'Cerveja Heineken long neck', 12.00, true, true),
('prod-005', 'demo-tenant-001', 'cat-002', 'Caldo de Feijão', 'Caldo de feijão com bacon', 15.00, true, true),
('prod-006', 'demo-tenant-001', 'cat-002', 'Bolinho de Bacalhau', '6 unidades de bolinho de bacalhau', 25.00, true, true),
('prod-007', 'demo-tenant-001', 'cat-003', 'Filé à Parmegiana', 'Filé empanado com queijo e molho', 45.00, true, true),
('prod-008', 'demo-tenant-001', 'cat-003', 'Picanha na Chapa', 'Picanha grelhada com arroz e farofa', 65.00, true, true),
('prod-009', 'demo-tenant-001', 'cat-003', 'Frango Grelhado', 'Peito de frango grelhado com legumes', 35.00, true, true),
('prod-010', 'demo-tenant-001', 'cat-004', 'Pudim', 'Pudim de leite condensado', 12.00, true, true),
('prod-011', 'demo-tenant-001', 'cat-004', 'Petit Gateau', 'Petit gateau com sorvete de creme', 18.00, true, true),
('prod-012', 'demo-tenant-001', 'cat-005', 'Batata Frita', 'Porção de batata frita crocante', 25.00, true, true),
('prod-013', 'demo-tenant-001', 'cat-005', 'Isca de Frango', 'Porção de isca de frango empanada', 28.00, true, true)
ON CONFLICT DO NOTHING;

SELECT 'Seed completed successfully!' AS result;
