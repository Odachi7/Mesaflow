
const fetch = require('node-fetch'); // Ou nativo se Node 18+

const API_URL = 'http://localhost:3001';

async function run() {
    try {
        console.log('--- Iniciando Teste de Isolamento Multi-Tenant ---');

        const suffix = Date.now();

        // 1. Criar Users/Tenants (assumindo rota de registro ou criando via banco se precisar)
        // Como nao tenho rota publica de registro de tenant fácil, vou usar o login de users existentes ou criar no banco via script se eu tivesse acesso ao prisma aqui.
        // Mas esse script roda fora.
        // Vou assumir que o sistema tem um endpoint de setup ou vou precisar de usuarios validos.
        // Se eu nao conseguir criar usuarios, esse script falha.
        // O teste E2E anterior conseguia criar pq tinha acesso ao Prisma.

        // Vou usar o PrismaClient neste script para criar os dados necessários!
        // Preciso importar o PrismaClient.

        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const bcrypt = require('bcrypt');

        console.log('1. Criando Tenants e Usuários no Banco...');

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash('password123', salt);

        // Tenant A
        const tenantA = await prisma.tenant.create({
            data: { name: `Test Tenant A ${suffix}`, slug: `test-tenant-a-${suffix}` }
        });
        const userA = await prisma.user.create({
            data: {
                email: `adminA_${suffix}@test.com`,
                passwordHash: hash,
                fullName: 'Test Admin A',
                role: 'admin',
                tenantId: tenantA.id
            }
        });

        // Tenant B
        const tenantB = await prisma.tenant.create({
            data: { name: `Test Tenant B ${suffix}`, slug: `test-tenant-b-${suffix}` }
        });
        const userB = await prisma.user.create({
            data: {
                email: `adminB_${suffix}@test.com`,
                passwordHash: hash,
                fullName: 'Test Admin B',
                role: 'admin',
                tenantId: tenantB.id
            }
        });

        console.log('2. Autenticando...');

        // Login A
        const resA = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userA.email, password: 'password123' })
        });
        const dataA = await resA.json();
        const tokenA = dataA.accessToken;

        // Login B
        const resB = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userB.email, password: 'password123' })
        });
        const dataB = await resB.json();
        const tokenB = dataB.accessToken;

        if (!tokenA || !tokenB) {
            throw new Error('Falha no login');
        }
        console.log('Login OK');

        console.log('3. Criando Produto no Tenant A...');
        const resProd = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenA}`
            },
            body: JSON.stringify({
                name: `Produto Exclusivo A - ${suffix}`,
                description: 'Teste',
                price: 100,
                isAvailable: true
            })
        });

        const prodData = await resProd.json();
        if (!resProd.ok) {
            console.error('Erro ao criar produto:', prodData);
            throw new Error('Falha ao criar produto');
        }
        const prodId = prodData.id;
        console.log(`Produto criado: ${prodId}`);

        console.log('4. Tentando acessar Produto A com Token B...');

        // Listagem
        const resList = await fetch(`${API_URL}/products`, {
            headers: { 'Authorization': `Bearer ${tokenB}` }
        });
        const listData = await resList.json();
        const foundInList = listData.find(p => p.id === prodId);

        if (foundInList) {
            throw new Error('FALHA DE SEGURANÇA: Produto de A visível na lista de B!');
        }
        console.log('Listagem OK (Produto não visível)');

        // Detalhes
        const resDetail = await fetch(`${API_URL}/products/${prodId}`, {
            headers: { 'Authorization': `Bearer ${tokenB}` }
        });

        if (resDetail.status === 200) {
            throw new Error('FALHA DE SEGURANÇA: Detalhes do produto de A acessíveis por B!');
        }
        console.log(`Detalhes OK (Status ${resDetail.status})`);

        console.log('--- TESTE DE ISOLAMENTO PASSOU COM SUCESSO ---');

        // Cleanup (opcional)
        // await prisma.tenant.delete({ where: { id: tenantA.id } }); ...

    } catch (error) {
        console.error('TESTE FALHOU:', error);
        process.exit(1);
    }
}

run();
