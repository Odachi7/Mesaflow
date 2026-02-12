
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';

describe('Multi-Tenant Isolation (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Data
    let tenantA: any;
    let tenantB: any;
    let userA: any;
    let userB: any;
    let tokenA: string;
    let tokenB: string;
    let productAId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe()); // Enable validation
        prisma = app.get(PrismaService);
        await app.init();
    });

    afterAll(async () => {
        // Cleanup products to avoid clutter (optional, implementation specific)
        if (productAId) {
            await prisma.product.deleteMany({ where: { id: productAId } });
        }
        // Cleanup users and tenants could be tricky due to FKs, usually we truncate in test env
        // or use a transaction rollback strategy. For this smoke test, we'll leave data or rely on random implementation.
        await app.close();
    });

    it('1. Setup: Create Tenants and Users', async () => {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash('password123', salt);
        const suffix = Date.now();

        // --- Tenant A Setup ---
        tenantA = await prisma.tenant.create({
            data: {
                name: `Tenant A ${suffix}`,
                slug: `tenant-a-${suffix}`,
            },
        });

        userA = await prisma.user.create({
            data: {
                email: `adminA_${suffix}@test.com`,
                passwordHash,
                fullName: 'Admin A',
                role: 'admin',
                tenantId: tenantA.id,
                isActive: true,
            },
        });

        // --- Tenant B Setup ---
        tenantB = await prisma.tenant.create({
            data: {
                name: `Tenant B ${suffix}`,
                slug: `tenant-b-${suffix}`,
            },
        });

        userB = await prisma.user.create({
            data: {
                email: `adminB_${suffix}@test.com`,
                passwordHash,
                fullName: 'Admin B',
                role: 'admin',
                tenantId: tenantB.id,
                isActive: true,
            },
        });

        expect(tenantA.id).toBeDefined();
        expect(tenantB.id).toBeDefined();
        expect(tenantA.id).not.toEqual(tenantB.id);
    });

    it('2. Authenticate: Get Tokens for Both Users', async () => {
        // Login A
        const loginA = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: userA.email, password: 'password123' })
            .expect(201);

        tokenA = loginA.body.accessToken;
        expect(tokenA).toBeDefined();

        // Login B
        const loginB = await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: userB.email, password: 'password123' })
            .expect(201);

        tokenB = loginB.body.accessToken;
        expect(tokenB).toBeDefined();
    });

    it('3. Isolation: Tenant A creates a Product', async () => {
        const createDto = {
            name: 'Product Tenant A',
            description: 'Exclusive to A',
            price: 100.50,
            categoryId: null, // Optional in some implementations, checking if required
        };

        // Assuming we might need a category first if required, but let's try creating product directly.
        // If strict relation, we might need a Category A first. 
        // Let's create a category for A to be safe.
        const categoryRes = await request(app.getHttpServer())
            .post('/categories')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ name: 'Category A' })
            .expect(201);

        const categoryId = categoryRes.body.id;

        const res = await request(app.getHttpServer())
            .post('/products')
            .set('Authorization', `Bearer ${tokenA}`)
            .send({ ...createDto, categoryId })
            .expect(201);

        productAId = res.body.id;
        expect(res.body.name).toEqual(createDto.name);

        // Verify in DB that it belongs to Tenant A
        const productInDb = await prisma.product.findUnique({ where: { id: productAId } });
        expect(productInDb.tenantId).toEqual(tenantA.id);
    });

    it('4. Isolation: Tenant B cannot list Tenant A products', async () => {
        const res = await request(app.getHttpServer())
            .get('/products')
            .set('Authorization', `Bearer ${tokenB}`)
            .expect(200);

        const productsB = res.body;
        expect(Array.isArray(productsB)).toBe(true);

        // Check if Product A is in the list
        const found = productsB.find(p => p.id === productAId);
        expect(found).toBeUndefined();
    });

    it('5. Isolation: Tenant B cannot access Tenant A product details', async () => {
        // Should fail with 404 (Not Found) because the query usually includes `where: { tenantId, id }`
        // Or 403 if there is an explicit check. Most NestJS CRUDs using Prisma + Tenant Middleware return 404.
        await request(app.getHttpServer())
            .get(`/products/${productAId}`)
            .set('Authorization', `Bearer ${tokenB}`)
            .expect(404);
    });
});
