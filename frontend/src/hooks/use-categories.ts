import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { App } from 'antd';

export interface Category {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    displayOrder: number;
    _count?: {
        products: number;
    };
}

interface CreateCategoryDto {
    name: string;
    description?: string;
    isActive?: boolean;
    displayOrder?: number;
}

interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
    id: string;
}

export const useCategories = () => {
    const { message } = App.useApp();
    const queryClient = useQueryClient();

    // Fetch categories
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

    // Create category
    const createCategoryMutation = useMutation({
        mutationFn: async (data: CreateCategoryDto) => {
            const response = await api.post('/categories', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            message.success('Categoria criada com sucesso!');
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Erro ao criar categoria';
            message.error(Array.isArray(msg) ? msg[0] : msg);
        },
    });

    // Update category
    const updateCategoryMutation = useMutation({
        mutationFn: async ({ id, ...data }: UpdateCategoryDto) => {
            const response = await api.patch(`/categories/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            message.success('Categoria atualizada com sucesso!');
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Erro ao atualizar categoria';
            message.error(Array.isArray(msg) ? msg[0] : msg);
        },
    });

    // Delete category
    const deleteCategoryMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/categories/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            message.success('Categoria excluída com sucesso!');
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Erro ao excluir categoria';
            message.error(Array.isArray(msg) ? msg[0] : msg);
        },
    });

    return {
        categories: categories || [],
        isLoading,
        error,
        createCategory: createCategoryMutation.mutate,
        updateCategory: updateCategoryMutation.mutate,
        deleteCategory: deleteCategoryMutation.mutate,
        isCreating: createCategoryMutation.isPending,
        isUpdating: updateCategoryMutation.isPending,
        isDeleting: deleteCategoryMutation.isPending,
    };
};
