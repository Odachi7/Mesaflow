
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    cpf?: string;
    birthDate?: string;
    notes?: string;
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: string;
}

export const useCustomers = () => {
    // Fetch Customers
    const {
        data: customers,
        isLoading,
        error
    } = useQuery<Customer[]>({
        queryKey: ['customers'],
        queryFn: async () => {
            const response = await api.get('/customers');
            return response.data;
        }
    });

    return {
        customers: customers || [],
        isLoading,
        error,
    };
};
