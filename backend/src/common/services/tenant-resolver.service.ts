import { Injectable, BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export interface TenantResolutionResult {
    tenantId: string;
    source: 'jwt' | 'header' | 'subdomain';
}

@Injectable()
export class TenantResolverService {

    resolveTenant(req: Request): TenantResolutionResult {
        // 2. Tentar decodificar JWT do header Authorization manualmente
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                // Decode payload (second part of JWT)
                const base64Url = token.split('.')[1];
                if (base64Url) {
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
                    const payload = JSON.parse(jsonPayload);

                    if (payload.tenantId) {
                        return {
                            tenantId: payload.tenantId,
                            source: 'jwt',
                        };
                    }
                }
            } catch (e) {
                // Ignore invalid tokens here, let AuthGuard handle it
            }
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

    private extractTenantFromSubdomain(hostname: string): string | null {
        const parts = hostname.split('.');

        if (parts.length > 2) {
            return parts[0];
        }

        return null;
    }
}
