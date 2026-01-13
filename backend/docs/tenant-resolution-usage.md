# Exemplos de Uso - Tenant Resolution

Este documento mostra como usar a nova arquitetura de resolução de tenant no seu código.

## 1. Protegendo Rotas Autenticadas

Use o `JwtAuthGuard` para proteger rotas que requerem autenticação:

```typescript
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return {
      user: req.user,
      message: `Bem-vindo ao tenant ${req.user.tenantId}`,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Controller('admin')
  export class AdminController {
  }
}
```

## 2. Rotas Públicas com Header ou Subdomain

Para rotas que não requerem autenticação, o tenant será extraído do header ou subdomain:

```typescript
import { Controller, Get } from '@nestjs/common';
import { Tenant } from '@common/decorators/tenant.decorator';

@Controller('public')
export class PublicController {
  @Get('info')
  getInfo(@Tenant() tenantId: string) {
    return {
      tenantId,
      message: 'Esta rota não requer autenticação',
    };
  }
}
```

```bash
curl -H "X-Tenant-ID: tenant1" http://localhost:3000/api/public/info

curl http://tenant1.localhost:3000/api/public/info
```

A resolução de tenant segue esta ordem:

```bash
curl -H "Authorization: Bearer <jwt-token>" \
     -H "X-Tenant-ID: malicious-tenant" \
     http://localhost:3000/api/users/profile

```bash
curl -H "X-Tenant-ID: tenant1" \
     http://localhost:3000/api/public/info

```bash
curl http://tenant1.localhost:3000/api/public/info

```

```typescript
import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class MyService {
  constructor(private cls: ClsService) {}

  someMethod() {
    const tenantId = this.cls.get('tenantId');
    const source = this.cls.get('tenantSource'); 
    
    console.log(`Tenant ${tenantId} resolvido via ${source}`);
  }
}
```

```typescript

```

**✅ Agora (seguro):**
```typescript
```


```bash
curl -H "Authorization: Bearer <token-tenant1>" \
     -H "X-Tenant-ID: tenant2" \
     http://localhost:3000/api/users/profile

```

```typescript
@Get()
getData(@Tenant() tenantId: string) {
}
```

```typescript

@UseGuards(JwtAuthGuard)
@Get('protected')
getData(@Req() req: Request, @Tenant() tenantId: string) {
}
```

```typescript
@UseGuards(JwtAuthGuard)
@Delete(':id')
deleteUser(@Param('id') id: string) {
}
```

```typescript
@Get('health')
healthCheck(@Tenant() tenantId: string) {
}
```

```typescript
const tenantId = req.headers['x-tenant-id'];

@Tenant() tenantId: string
```

```bash
npm run test:e2e -- tenant-resolution.e2e-spec.ts

```
