import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { App } from 'antd';

export interface Category {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    displayOrder: number;
}

export const useCategories = () => {
    const { message } = App.useApp();
    const queryClient = useQueryClient();

    const {
        data: categories,
        isLoading,
        error
    } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories');
            return response.data;
        }
    });

    return {
        categories: categories || [],
        isLoading,
        error
    };
};
