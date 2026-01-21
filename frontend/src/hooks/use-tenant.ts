import { useTenantStore } from '@/store/tenant-store';

export const useTenant = () => {
    const { tenant, setTenant, clearTenant } = useTenantStore();

    return {
        tenant,
        setTenant,
        clearTenant,
        tenantId: tenant?.id || null,
        tenantName: tenant?.name || null,
        subdomain: tenant?.subdomain || null,
    };
};
