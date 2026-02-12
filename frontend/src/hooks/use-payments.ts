
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { App } from 'antd';

export interface Payment {
    id: string;
    orderId: string;
    paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'pix';
    amount: number;
    status: string;
    createdAt: string;
}

export interface CreatePaymentDto {
    orderId: string;
    paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'pix';
    amount: number;
}

export const usePayments = (orderId?: string) => {
    const { message } = App.useApp();
    const queryClient = useQueryClient();

    // List Payments for an Order
    const { data: payments, isLoading: isLoadingPayments } = useQuery<Payment[]>({
        queryKey: ['payments', orderId],
        queryFn: async () => {
            if (!orderId) return [];
            const response = await api.get(`/payments?orderId=${orderId}`);
            return response.data;
        },
        enabled: !!orderId,
    });

    // Create Payment
    const createPaymentMutation = useMutation({
        mutationFn: async (data: CreatePaymentDto) => {
            const response = await api.post('/payments', data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['payments', variables.orderId] });
            queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
            message.success('Pagamento registrado com sucesso!');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Erro ao registrar pagamento');
        },
    });

    return {
        payments: payments || [],
        isLoading: isLoadingPayments,
        createPayment: createPaymentMutation.mutate,
        isPaying: createPaymentMutation.isPending,
    };
};
