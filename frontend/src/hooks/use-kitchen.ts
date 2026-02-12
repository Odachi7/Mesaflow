
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth';
import api from '@/lib/api';
import { Order, OrderItem } from '@/hooks/use-orders';
import { App } from 'antd';

export const useKitchen = () => {
    const { token, user } = useAuth();
    const { message } = App.useApp();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial fetch of active orders
    const fetchActiveOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/orders?status=open');
            setActiveOrders(response.data);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            message.error('Erro ao carregar pedidos');
        } finally {
            setIsLoading(false);
        }
    }, [message]);

    useEffect(() => {
        fetchActiveOrders();
    }, [fetchActiveOrders]);

    // WebSocket Connection
    useEffect(() => {
        if (!token) return;

        const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

        const newSocket = io(`${socketUrl}/events`, {
            auth: {
                token: token,
            },
            transports: ['websocket'],
            autoConnect: true,
        });

        newSocket.on('connect', () => {
            console.log('Kitchen connected to WebSocket');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Kitchen disconnected from WebSocket');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('WebSocket connection error:', err);
            setIsConnected(false);
        });

        // Event Listeners
        newSocket.on('order.created', (newOrder: Order) => {
            console.log('New order received:', newOrder);
            message.info(`Novo pedido recebido: #${newOrder.orderNumber}`);
            setActiveOrders(prev => [newOrder, ...prev]);
        });

        newSocket.on('order.updated', (updatedOrder: Order) => {
            console.log('Order updated:', updatedOrder);
            setActiveOrders(prev => {
                const index = prev.findIndex(o => o.id === updatedOrder.id);
                if (index !== -1) {
                    const newOrders = [...prev];

                    // If order is closed/cancelled, remove it from kitchen view
                    if (updatedOrder.status !== 'open') {
                        return prev.filter(o => o.id !== updatedOrder.id);
                    }

                    newOrders[index] = updatedOrder;
                    return newOrders;
                }
                // If not found but is open, add it (maybe it was just created or we missed it)
                if (updatedOrder.status === 'open') {
                    return [updatedOrder, ...prev];
                }
                return prev;
            });
        });

        newSocket.on('order.status_changed', (updatedOrder: Order) => {
            setActiveOrders(prev => {
                if (updatedOrder.status !== 'open') {
                    return prev.filter(o => o.id !== updatedOrder.id);
                }
                return prev;
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [token, message]);

    const updateItemStatus = async (orderId: string, itemId: string, status: string) => {
        try {
            await api.patch(`/orders/${orderId}/items/${itemId}/status`, { status });
            // Optimistic update handled by socket event, but we can do it locally too for speed
            setActiveOrders(prev => prev.map(order => {
                if (order.id === orderId) {
                    return {
                        ...order,
                        items: order.items.map(item =>
                            item.id === itemId ? { ...item, status } : item
                        )
                    };
                }
                return order;
            }));
            message.success('Status do item atualizado');
        } catch (error) {
            console.error('Error updating item status:', error);
            message.error('Erro ao atualizar status');
        }
    };

    return {
        activeOrders,
        isConnected,
        isLoading,
        updateItemStatus,
        refresh: fetchActiveOrders,
    };
};
