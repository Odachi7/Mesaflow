
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Fetch nativo do Node 18+ ou polyfill se necessário
// Se der erro, o usuário precisará de node-fetch, mas vamos tentar nativo.
const fetch = global.fetch || require('node-fetch');

const prisma = new PrismaClient();
const API_URL = 'http://127.0.0.1:3002'; // Use dedicated test port

async function run() {
    try {
        console.log(`--- Iniciando Teste de Isolamento Multi-Tenant (JS) contra ${API_URL} ---`);

        const suffix = Date.now();

        console.log('1. Criando Tenants e Usuários no Banco...');

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash('password123', salt);

        // Tenant A
        const tenantA = await prisma.tenant.create({
            data: {
                name: `Test Tenant A ${suffix}`,
                subdomain: `test-a-${suffix}`, // Added subdomain
                planType: 'basic' // Added planType
            }
        });
        const userA = await prisma.user.create({
            data: {
                email: `adminA_${suffix}@test.com`,
                passwordHash: hash,
                fullName: 'Test Admin A',
                role: 'admin',
                tenantId: tenantA.id,
                isActive: true
            }
        });
        console.log(`[DEBUG] Usuário A criado: ${userA.email} (ID: ${userA.id})`);

        // Verify if user exists immediately
        const verifyUserA = await prisma.user.findFirst({ where: { email: userA.email } });
        console.log(`[DEBUG] Verificação imediata: ${verifyUserA ? 'Encontrado' : 'NÃO ENCONTRADO'}`);

        // Tenant B
        const tenantB = await prisma.tenant.create({
            data: {
                name: `Test Tenant B ${suffix}`,
                subdomain: `test-b-${suffix}`, // Added subdomain
                planType: 'basic' // Added planType
            }
        });
        const userB = await prisma.user.create({
            data: {
                email: `adminB_${suffix}@test.com`,
                passwordHash: hash,
                fullName: 'Test Admin B',
                role: 'admin',
                tenantId: tenantB.id,
                isActive: true
            }
        });

        console.log('2. Autenticando...');

        // Login A
        const resA = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': tenantA.id // Enviar tenant ID para ajudar contexto
            },
            body: JSON.stringify({ email: userA.email, password: 'password123' })
        });

        if (!resA.ok) {
            console.error('Login A falhou:', resA.status, await resA.text());
            throw new Error('Login A falhou');
        }

        const dataA = await resA.json();
        const tokenA = dataA.accessToken;

        // Login B
        const resB = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': tenantB.id
            },
            body: JSON.stringify({ email: userB.email, password: 'password123' })
        });

        if (!resB.ok) {
            console.error('Login B falhou:', resB.status, await resB.text());
            throw new Error('Login B falhou');
        }

        const dataB = await resB.json();
        const tokenB = dataB.accessToken;

        if (!tokenA || !tokenB) {
            throw new Error('Falha ao obter tokens');
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
                description: 'Teste de Isolamento',
                price: 150.00,
                isAvailable: true
            })
        });

        const prodData = await resProd.json();
        if (!resProd.ok) {
            console.error('Erro ao criar produto:', prodData);
            throw new Error('Falha ao criar produto');
        }
        const prodId = prodData.id;
        console.log(`Produto criado com ID: ${prodId}`);

        console.log('4. Tentando acessar Produto A com Token B (Violação de Isolamento)...');

        // Listagem
        const resList = await fetch(`${API_URL}/products`, {
            headers: { 'Authorization': `Bearer ${tokenB}` }
        });
        const listData = await resList.json();

        if (!Array.isArray(listData)) {
            console.error('Listagem inválida:', listData);
            throw new Error('Retorno da listagem não é array');
        }

        const foundInList = listData.find(p => p.id === prodId);

        if (foundInList) {
            throw new Error('❌ FALHA CRÍTICA: Produto do Tenant A apareceu na lista do Tenant B!');
        }
        console.log('✅ Listagem OK - Produto A não visível para B.');

        // Detalhes (Tentativa de acesso direto)
        const resDetail = await fetch(`${API_URL}/products/${prodId}`, {
            headers: { 'Authorization': `Bearer ${tokenB}` }
        });

        if (resDetail.status === 200) {
            throw new Error(`❌ FALHA CRÍTICA: Detalhes do produto A acessíveis por B! (Status 200)`);
        } else if (resDetail.status === 404 || resDetail.status === 403) {
            console.log(`✅ Detalhes OK - Acesso direto bloqueado (Status ${resDetail.status}).`);
        } else {
            console.warn(`⚠️ Status inesperado ao acessar detalhes: ${resDetail.status}`);
        }

        console.log('--- TESTE DE ISOLAMENTO CONCLUÍDO COM SUCESSO! 🔒 ---');

    } catch (error) {
        console.error('🔴 ERRO NO TESTE:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

run();
