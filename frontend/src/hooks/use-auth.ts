import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { App } from 'antd';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useTenantStore } from '@/store/tenant-store';
import { connectSocket } from '@/lib/socket';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { message } = App.useApp();
    const { login: setAuth, logout: clearAuth, user, isAuthenticated } = useAuthStore();
    const { setTenant, clearTenant } = useTenantStore();

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await api.post('/auth/login', { email, password });

            const { user, accessToken } = response.data;

            // Atualizar store de autenticação
            setAuth(user, accessToken);

            // Atualizar store de tenant
            if (user.tenantId) {
                setTenant({
                    id: user.tenantId,
                    name: user.tenant?.name || 'My Tenant',
                    subdomain: user.tenant?.subdomain || '',
                    planType: user.tenant?.planType || 'basic',
                });
            }

            // Conectar socket
            connectSocket(accessToken);

            message.success('Login realizado com sucesso!');
            router.push('/dashboard');

            return true;
        } catch (error: any) {
            console.error('Login error:', error);
            const msg = error.response?.data?.message || 'Falha na autenticação';
            message.error(Array.isArray(msg) ? msg[0] : msg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        clearAuth();
        clearTenant();
        router.push('/login');
    };

    return {
        login,
        logout,
        isLoading,
        user,
        isAuthenticated
    };
};
