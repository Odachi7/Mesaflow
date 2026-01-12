import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) { }

  use(req: Request, res: Response, next: NextFunction) {
    let tenantId: string | null = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      tenantId = this.extractTenantFromSubdomain(req.hostname);
    }

    // Se ainda não encontrou, tentar extrair do token JWT (será implementado depois)
    // if (!tenantId && req.user) {
    //   tenantId = req.user.tenantId;
    // }

    if (!tenantId) {
      throw new BadRequestException(
        'Tenant ID is required. Please provide X-Tenant-ID header.',
      );
    }

    this.cls.set('tenantId', tenantId);

    next();
  }

  private extractTenantFromSubdomain(hostname: string): string | null {
    const parts = hostname.split('.');

    if (parts.length > 2) {
      return parts[0];
    }

    return null;
  }
}
