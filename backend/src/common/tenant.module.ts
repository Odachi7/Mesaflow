import { Module } from '@nestjs/common';
import { TenantResolverService } from './services/tenant-resolver.service';

@Module({
    providers: [TenantResolverService],
    exports: [TenantResolverService],
})
export class TenantModule { }
