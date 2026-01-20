import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    tenantId: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => {
                // Salvar token no localStorage para o axios interceptor pegar (opcional, já que persist salva o state)
                // Mas o interceptor lê de onde? Do localStorage direto se persist salvo lá
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', token);
                    localStorage.setItem('tenantId', user.tenantId);
                }
                set({ user, token, isAuthenticated: true });
            },
            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('tenantId');
                }
                set({ user: null, token: null, isAuthenticated: false });
            },
            updateUser: (updates) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null,
                })),
        }),
        {
            name: 'mesaflow-auth', // nome para localStorage
        }
    )
);
