import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';

import { DatabaseModule } from './database/database.module';
import { TenantModule } from './common/tenant.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),

    // CLS for tenant context
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),

    // Database
    DatabaseModule,

    // Tenant Resolution
    TenantModule,

    // Modules
    AuthModule,
    TenantsModule,
    UsersModule,
  ],
})
export class AppModule { }
