import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TenantResolverService } from './services/tenant-resolver.service';
import { TenantMiddleware } from './middleware/tenant.middleware';

@Module({
    providers: [TenantResolverService, TenantMiddleware],
    exports: [TenantResolverService],
})
export class TenantModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(TenantMiddleware)
            .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
}
