import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar Tenant de teste
    const tenant = await prisma.tenant.upsert({
        where: { subdomain: 'demo' },
        update: {},
        create: {
            name: 'Restaurante Demo',
            subdomain: 'demo',
            planType: 'premium',
            isActive: true,
            settings: {
                serviceTax: 10,
                currency: 'BRL',
                timezone: 'America/Sao_Paulo',
            },
        },
    });

    console.log(`✅ Tenant criado: ${tenant.name} (${tenant.id})`);

    // Criar usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: tenant.id,
                email: 'admin@demo.com',
            },
        },
        update: {},
        create: {
            tenantId: tenant.id,
            email: 'admin@demo.com',
            passwordHash: hashedPassword,
            fullName: 'Administrador',
            role: 'admin',
            isActive: true,
        },
    });

    console.log(`✅ Usuário admin criado: ${admin.email}`);

    // Criar usuário garçom
    const waiter = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: tenant.id,
                email: 'garcom@demo.com',
            },
        },
        update: {},
        create: {
            tenantId: tenant.id,
            email: 'garcom@demo.com',
            passwordHash: hashedPassword,
            fullName: 'João Garçom',
            role: 'waiter',
            isActive: true,
        },
    });

    console.log(`✅ Usuário garçom criado: ${waiter.email}`);

    // Criar categorias
    const categories = [
        { name: 'Bebidas', description: 'Bebidas geladas e quentes', displayOrder: 1 },
        { name: 'Entradas', description: 'Petiscos e aperitivos', displayOrder: 2 },
        { name: 'Pratos Principais', description: 'Pratos do dia e especialidades', displayOrder: 3 },
        { name: 'Sobremesas', description: 'Doces e sobremesas', displayOrder: 4 },
        { name: 'Porções', description: 'Porções para compartilhar', displayOrder: 5 },
    ];

    for (const cat of categories) {
        const category = await prisma.category.upsert({
            where: {
                id: `seed-cat-${cat.displayOrder}`,
            },
            update: { ...cat },
            create: {
                id: `seed-cat-${cat.displayOrder}`,
                tenantId: tenant.id,
                ...cat,
                isActive: true,
            },
        });
        console.log(`✅ Categoria criada: ${category.name}`);
    }

    // Criar mesas
    for (let i = 1; i <= 10; i++) {
        const table = await prisma.table.upsert({
            where: {
                tenantId_tableNumber: {
                    tenantId: tenant.id,
                    tableNumber: `${i}`,
                },
            },
            update: {},
            create: {
                tenantId: tenant.id,
                tableNumber: `${i}`,
                capacity: i <= 5 ? 4 : 6,
                status: 'available',
            },
        });
        console.log(`✅ Mesa criada: ${table.tableNumber}`);
    }

    // Criar produtos de exemplo
    const products = [
        { categoryOrder: 1, name: 'Coca-Cola 350ml', price: 6.00, description: 'Refrigerante Coca-Cola lata' },
        { categoryOrder: 1, name: 'Água Mineral 500ml', price: 4.00, description: 'Água mineral sem gás' },
        { categoryOrder: 1, name: 'Suco Natural', price: 8.00, description: 'Suco de laranja, limão ou maracujá' },
        { categoryOrder: 1, name: 'Cerveja Heineken', price: 12.00, description: 'Cerveja Heineken 600ml' },
        { categoryOrder: 2, name: 'Caldo de Feijão', price: 15.00, description: 'Caldo de feijão com bacon' },
        { categoryOrder: 2, name: 'Bolinho de Bacalhau', price: 25.00, description: '6 unidades de bolinho de bacalhau' },
        { categoryOrder: 3, name: 'Filé à Parmegiana', price: 45.00, description: 'Filé empanado com queijo e molho' },
        { categoryOrder: 3, name: 'Picanha na Chapa', price: 65.00, description: 'Picanha grelhada com arroz e farofa' },
        { categoryOrder: 3, name: 'Frango Grelhado', price: 35.00, description: 'Peito de frango grelhado com legumes' },
        { categoryOrder: 4, name: 'Pudim', price: 12.00, description: 'Pudim de leite condensado' },
        { categoryOrder: 4, name: 'Petit Gateau', price: 18.00, description: 'Petit gateau com sorvete de creme' },
        { categoryOrder: 5, name: 'Batata Frita', price: 25.00, description: 'Porção de batata frita crocante' },
        { categoryOrder: 5, name: 'Isca de Frango', price: 28.00, description: 'Porção de isca de frango empanada' },
    ];

    for (let i = 0; i < products.length; i++) {
        const prod = products[i];
        const product = await prisma.product.upsert({
            where: { id: `seed-prod-${i + 1}` },
            update: {},
            create: {
                id: `seed-prod-${i + 1}`,
                tenantId: tenant.id,
                categoryId: `seed-cat-${prod.categoryOrder}`,
                name: prod.name,
                description: prod.description,
                price: prod.price,
                isAvailable: true,
                isActive: true,
            },
        });
        console.log(`✅ Produto criado: ${product.name}`);
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📋 Credenciais de teste:');
    console.log('   Email: admin@demo.com');
    console.log('   Senha: admin123');
    console.log(`   Tenant ID: ${tenant.id}`);
    console.log('   Header: X-Tenant-ID ou subdomain: demo');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
