
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { App } from 'antd';

export interface OrderItem {
    id: string;
    productId: string;
    product: {
        name: string;
    };
    quantity: number;
    unitPrice: number;
    subtotal: number;
    status: string;
    notes?: string;
}

export interface Order {
    id: string;
    orderNumber: number;
    tableId?: string;
    table?: {
        tableNumber: string;
    };
    waiterId?: string;
    waiter?: {
        fullName: string;
    };
    customerId?: string;
    customer?: {
        name: string;
    };
    customerName?: string;
    status: 'open' | 'closed' | 'cancelled';
    orderType: 'dine_in' | 'takeaway' | 'delivery';
    items: OrderItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    notes?: string;
    openedAt: string;
    closedAt?: string;
}

interface CreateOrderDto {
    tableId?: string;
    waiterId?: string;
    customerId?: string;
    customerName?: string;
    orderType: 'dine_in' | 'takeaway' | 'delivery';
    notes?: string;
}

interface AddOrderItemDto {
    orderId: string;
    productId: string;
    quantity: number;
    notes?: string;
}

interface UpdateItemQuantityDto {
    orderId: string;
    itemId: string;
    quantity: number;
}

interface RemoveItemDto {
    orderId: string;
    itemId: string;
}

interface ApplyDiscountDto {
    orderId: string;
    discount: number;
}

export const useOrders = (filters?: { status?: string; tableId?: string }) => {
    const { message } = App.useApp();
    const queryClient = useQueryClient();

    // Fetch All Orders
    const {
        data: orders,
        isLoading,
        error
    } = useQuery<Order[]>({
        queryKey: ['orders', filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.tableId) params.append('tableId', filters.tableId);

            const response = await api.get(`/orders?${params.toString()}`);
            return response.data;
        }
    });

    // Create Order
    const createOrderMutation = useMutation({
        mutationFn: async (data: CreateOrderDto) => {
            const response = await api.post('/orders', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            message.success('Pedido aberto com sucesso!');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Erro ao abrir pedido');
        },
    });

    // Add Item
    const addItemMutation = useMutation({
        mutationFn: async ({ orderId, ...data }: AddOrderItemDto) => {
            const response = await api.post(`/orders/${orderId}/items`, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
            message.success('Item adicionado!');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Erro ao adicionar item');
        },
    });

    // Update Item Quantity
    const updateItemQuantityMutation = useMutation({
        mutationFn: async ({ orderId, itemId, quantity }: UpdateItemQuantityDto) => {
            const response = await api.patch(`/orders/${orderId}/items/${itemId}/quantity`, { quantity });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Erro ao atualizar quantidade');
        },
    });

    // Remove Item
    const removeItemMutation = useMutation({
        mutationFn: async ({ orderId, itemId }: RemoveItemDto) => {
            const response = await api.delete(`/orders/${orderId}/items/${itemId}`);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
            message.success('Item removido!');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Erro ao remover item');
        },
    });

    // Close Order
    const closeOrderMutation = useMutation({
        mutationFn: async (orderId: string) => {
            const response = await api.post(`/orders/${orderId}/close`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            message.success('Pedido fechado com sucesso!');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Erro ao fechar pedido');
        },
    });

    // Cancel Order
    const cancelOrderMutation = useMutation({
        mutationFn: async (orderId: string) => {
            const response = await api.post(`/orders/${orderId}/cancel`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            message.success('Pedido cancelado com sucesso!');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Erro ao cancelar pedido');
        },
    });

    // Apply Discount
    const applyDiscountMutation = useMutation({
        mutationFn: async ({ orderId, discount }: ApplyDiscountDto) => {
            const response = await api.patch(`/orders/${orderId}/discount`, { discount });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
            message.success('Desconto aplicado com sucesso!');
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Erro ao aplicar desconto');
        },
    });

    return {
        orders: orders || [],
        isLoading,
        error,
        createOrder: createOrderMutation.mutate,
        addItem: addItemMutation.mutate,
        updateItemQuantity: updateItemQuantityMutation.mutate,
        removeItem: removeItemMutation.mutate,
        closeOrder: closeOrderMutation.mutate,
        cancelOrder: cancelOrderMutation.mutate,
        applyDiscount: applyDiscountMutation.mutate,
        isCreating: createOrderMutation.isPending,
        isAddingItem: addItemMutation.isPending,
    };
};

export const useOrder = (id: string) => {
    return useQuery<Order>({
        queryKey: ['order', id],
        queryFn: async () => {
            const response = await api.get(`/orders/${id}`);
            return response.data;
        },
        enabled: !!id,
    });
};
