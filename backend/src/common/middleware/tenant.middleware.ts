import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { TenantResolverService } from '../services/tenant-resolver.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly cls: ClsService,
    private readonly tenantResolver: TenantResolverService,
  ) { }

  use(req: Request, res: Response, next: NextFunction) {
    const { tenantId, source } = this.tenantResolver.resolveTenant(req);

    this.cls.set('tenantId', tenantId);
    this.cls.set('tenantSource', source);

    next();
  }
}
