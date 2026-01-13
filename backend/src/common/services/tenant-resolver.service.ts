import { Injectable, BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export interface TenantResolutionResult {
    tenantId: string;
    source: 'jwt' | 'header' | 'subdomain';
}

@Injectable()
export class TenantResolverService {
    /**
     * @param req 
     * @returns
     * @throws
     */
    resolveTenant(req: Request): TenantResolutionResult {
        if (req.user?.tenantId) {
            return {
                tenantId: req.user.tenantId,
                source: 'jwt',
            };
        }

        const headerTenantId = req.headers['x-tenant-id'] as string;
        if (headerTenantId) {
            return {
                tenantId: headerTenantId,
                source: 'header',
            };
        }

        const subdomainTenantId = this.extractTenantFromSubdomain(req.hostname);
        if (subdomainTenantId) {
            return {
                tenantId: subdomainTenantId,
                source: 'subdomain',
            };
        }

        throw new BadRequestException(
            'Tenant ID é obrigatório. Forneça um token de autenticação, header X-Tenant-ID, ou acesse via subdomínio do tenant.',
        );
    }

    /**
     * @param hostname - Hostname da requisição
     * @returns Tenant ID extraído ou null
     */
    private extractTenantFromSubdomain(hostname: string): string | null {
        const parts = hostname.split('.');

        if (parts.length > 2) {
            return parts[0];
        }

        return null;
    }
}
