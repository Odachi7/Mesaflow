import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // 1. Tentar obter tenant_id do header X-Tenant-ID
    let tenantId: string | null = req.headers['x-tenant-id'] as string;

    // 2. Se não encontrar no header, tentar extrair do subdomínio
    if (!tenantId) {
      tenantId = this.extractTenantFromSubdomain(req.hostname);
    }

    // 3. Se ainda não encontrou, tentar extrair do token JWT (será implementado depois)
    // if (!tenantId && req.user) {
    //   tenantId = req.user.tenantId;
    // }

    // 4. Se nenhuma estratégia funcionou, lançar erro
    if (!tenantId) {
      throw new BadRequestException(
        'Tenant ID is required. Please provide X-Tenant-ID header.',
      );
    }

    // 5. Armazenar no ClsService para uso em toda a aplicação
    this.cls.set('tenantId', tenantId);

    next();
  }

  private extractTenantFromSubdomain(hostname: string): string | null {
    // Exemplo: restaurante-123.mesaflow.com -> restaurante-123
    const parts = hostname.split('.');

    // Se hostname tem mais de 2 partes (ex: subdomain.domain.com)
    // retorna a primeira parte como tenant
    if (parts.length > 2) {
      return parts[0];
    }

    return null;
  }
}
