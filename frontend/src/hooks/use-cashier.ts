
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { App } from 'antd';

export interface CashRegister {
    id: string;
    name: string;
    location?: string;
    isActive: boolean;
}

export interface CashSession {
    id: string;
    cashRegisterId: string;
    cashRegister: CashRegister;
    openingBalance: number;
    closingBalance?: number;
    expectedBalance?: number;
    difference?: number;
    status: 'open' | 'closed';
    openedAt: string;
    closedAt?: string;
}

export interface SessionSummary {
    sessionId: string;
    openedAt: string;
    openingBalance: number;
    sales: {
        total: number;
        [key: string]: number;
    };
    expectedBalance: number;
}

interface OpenSessionDto {
    cashRegisterId: string;
    openingBalance: number;
}

interface CloseSessionDto {
    sessionId: string;
    closingBalance: number;
}

export const useCashier = () => {
    const { message } = App.useApp();
    const queryClient = useQueryClient();

    // Fetch Available Cash Registers
    const { data: registers, isLoading: isLoadingRegisters } = useQuery<CashRegister[]>({
        queryKey: ['cash-registers'],
        queryFn: async () => {
            const response = await api.get('/cash-registers');
            return response.data;
        },
    });

    // Fetch Active Session for Current User
    const { data: session, isLoading: isLoadingSession, error: sessionError } = useQuery<CashSession | null>({
        queryKey: ['my-session'],
        queryFn: async () => {
            try {
                const response = await api.get('/cash-registers/me/session');
                return response.data || null;
            } catch (error) {
                return null;
            }
        },
        retry: false,
    });

    // Open Session
    const openSessionMutation = useMutation({
        mutationFn: async (data: OpenSessionDto) => {
            const response = await api.post('/cash-registers/session/open', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-session'] });
            message.success('Sessão de caixa aberta com sucesso!');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Erro ao abrir caixa');
        },
    });

    // Close Session
    const closeSessionMutation = useMutation({
        mutationFn: async ({ sessionId, closingBalance }: CloseSessionDto) => {
            const response = await api.post(`/cash-registers/session/${sessionId}/close`, { closingBalance });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-session'] });
            message.success('Sessão de caixa fechada com sucesso!');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Erro ao fechar caixa');
        },
    });

    // Fetch Session Summary
    const { data: summary, isLoading: isLoadingSummary } = useQuery<SessionSummary | null>({
        queryKey: ['session-summary'],
        queryFn: async () => {
            try {
                const response = await api.get('/cash-registers/me/session/summary');
                return response.data;
            } catch (error) {
                return null;
            }
        },
        enabled: !!session, // Only fetch if there is an active session
    });

    return {
        registers: registers || [],
        session,
        summary,
        isLoading: isLoadingRegisters || isLoadingSession || isLoadingSummary,
        openSession: openSessionMutation.mutate,
        closeSession: closeSessionMutation.mutate,
        isOpening: openSessionMutation.isPending,
        isClosing: closeSessionMutation.isPending,
    };
};
