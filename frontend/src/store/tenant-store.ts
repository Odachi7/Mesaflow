import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    planType: string;
    settings?: any;
}

interface TenantState {
    tenant: Tenant | null;
    setTenant: (tenant: Tenant) => void;
    clearTenant: () => void;
}

export const useTenantStore = create<TenantState>()(
    persist(
        (set) => ({
            tenant: null,
            setTenant: (tenant) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('tenantId', tenant.id);
                }
                set({ tenant });
            },
            clearTenant: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('tenantId');
                }
                set({ tenant: null });
            },
        }),
        {
            name: 'mesaflow-tenant',
        }
    )
);
