import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor(private readonly cls: ClsService) {
        super({
            log: ['error', 'warn'],
        });
    }

    async onModuleInit() {
        await this.$connect();

        // Middleware Prisma para injetar tenant_id automaticamente
        this.$use(async (params: any, next: (params: any) => Promise<any>) => {
            const tenantId = this.cls.get('tenantId');

            // Lista de models que não precisam de tenant_id (apenas Tenant)
            const modelsWithoutTenant = ['Tenant'];

            if (
                tenantId &&
                params.model &&
                !modelsWithoutTenant.includes(params.model)
            ) {
                // Queries de leitura: adicionar tenant_id no where
                if (params.action === 'findUnique' || params.action === 'findFirst') {
                    params.args.where = {
                        ...params.args.where,
                        tenantId: tenantId,
                    };
                }

                if (params.action === 'findMany') {
                    if (params.args.where) {
                        if (params.args.where.tenantId === undefined) {
                            params.args.where.tenantId = tenantId;
                        }
                    } else {
                        params.args.where = { tenantId: tenantId };
                    }
                }

                // Queries de escrita: adicionar tenant_id no data
                if (params.action === 'create') {
                    params.args.data = {
                        ...params.args.data,
                        tenantId: tenantId,
                    };
                }

                if (params.action === 'createMany') {
                    if (Array.isArray(params.args.data)) {
                        params.args.data = params.args.data.map((item: any) => ({
                            ...item,
                            tenantId: tenantId,
                        }));
                    } else {
                        params.args.data = {
                            ...params.args.data,
                            tenantId: tenantId,
                        };
                    }
                }

                // Update e Delete: garantir tenant_id no where
                if (params.action === 'update' || params.action === 'updateMany') {
                    params.args.where = {
                        ...params.args.where,
                        tenantId: tenantId,
                    };
                }

                if (params.action === 'delete' || params.action === 'deleteMany') {
                    params.args.where = {
                        ...params.args.where,
                        tenantId: tenantId,
                    };
                }
            }

            return next(params);
        });
    }

    async enableShutdownHooks(app: INestApplication) {
        process.on('beforeExit', async () => {
            await app.close();
        });
    }
}
