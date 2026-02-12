import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { App } from 'antd';

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    imageUrl?: string;
    preparationTime?: number;
    isAvailable: boolean;
    isActive: boolean;
    categoryId?: string;
    category?: {
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface CreateProductDto {
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    imageUrl?: string;
    preparationTime?: number;
    categoryId?: string;
    isAvailable?: boolean;
    isActive?: boolean;
}

interface UpdateProductDto extends Partial<CreateProductDto> {
    id: string;
}

interface ProductFilters {
    search?: string;
    categoryId?: string;
    onlyAvailable?: boolean;
    onlyActive?: boolean;
}

export const useProducts = (filters?: ProductFilters) => {
    const { message } = App.useApp();
    const queryClient = useQueryClient();

    // Fetch products
    const {
        data: products,
        isLoading,
        error,
    } = useQuery<Product[]>({
        queryKey: ['products', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.search) params.append('search', filters.search);
            if (filters?.categoryId && filters.categoryId !== 'all') params.append('categoryId', filters.categoryId);
            if (filters?.onlyAvailable) params.append('onlyAvailable', 'true');
            if (filters?.onlyActive !== undefined) params.append('onlyActive', String(filters.onlyActive));

            const response = await api.get(`/products?${params.toString()}`);
            return response.data;
        },
    });

    // Create product
    const createProductMutation = useMutation({
        mutationFn: async (data: CreateProductDto) => {
            const response = await api.post('/products', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            message.success('Produto criado com sucesso!');
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Erro ao criar produto';
            message.error(Array.isArray(msg) ? msg[0] : msg);
        },
    });

    // Update product
    const updateProductMutation = useMutation({
        mutationFn: async ({ id, ...data }: UpdateProductDto) => {
            const response = await api.patch(`/products/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            message.success('Produto atualizado com sucesso!');
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Erro ao atualizar produto';
            message.error(Array.isArray(msg) ? msg[0] : msg);
        },
    });

    // Delete product
    const deleteProductMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            message.success('Produto excluído com sucesso!');
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Erro ao excluir produto';
            message.error(Array.isArray(msg) ? msg[0] : msg);
        },
    });

    // Toggle availability
    const toggleAvailabilityMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await api.patch(`/products/${id}/toggle-availability`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            message.success('Disponibilidade alterada!');
        },
        onError: (error: any) => {
            message.error('Erro ao alterar disponibilidade');
        },
    });

    // Toggle active status
    const toggleActiveMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await api.patch(`/products/${id}/toggle-active`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            message.success('Status alterado com sucesso!');
        },
        onError: (error: any) => {
            message.error('Erro ao alterar status');
        },
    });

    return {
        products: products || [],
        isLoading,
        error,
        createProduct: createProductMutation.mutate,
        updateProduct: updateProductMutation.mutate,
        deleteProduct: deleteProductMutation.mutate,
        toggleAvailability: toggleAvailabilityMutation.mutate,
        toggleActive: toggleActiveMutation.mutate,
        isCreating: createProductMutation.isPending,
        isUpdating: updateProductMutation.isPending,
        isDeleting: deleteProductMutation.isPending,
    };
};
