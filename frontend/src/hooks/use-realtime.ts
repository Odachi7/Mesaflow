
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { useAuth } from '@/hooks/use-auth';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';

export const useRealtime = () => {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const { message, notification } = App.useApp();

    useEffect(() => {
        if (!token) return;

        // Connect to socket
        const socket = connectSocket(token);

        // Event Listeners

        // Orders
        socket.on('order.created', (data) => {
            console.log('Realtime: Order Created', data);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-recent'] });

            message.info(`Novo pedido #${data.orderNumber} criado!`);
        });

        socket.on('order.updated', (data) => {
            console.log('Realtime: Order Updated', data);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', data.id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
        });

        socket.on('order.status_changed', (data) => {
            console.log('Realtime: Order Status Changed', data);
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', data.id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-recent'] });

            const statusMap: Record<string, string> = {
                'ready': 'pronto',
                'closed': 'fechado',
                'cancelled': 'cancelado',
                'preparing': 'em preparo'
            };

            if (data.status === 'ready') {
                notification.success({
                    message: 'Pedido Pronto!',
                    description: `O pedido #${data.orderNumber} da Mesa ${data.table?.tableNumber || '?'} está pronto para entrega.`,
                    placement: 'bottomRight',
                });
            }
        });

        // Tables
        socket.on('table.updated', (data) => {
            console.log('Realtime: Table Updated', data);
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-overview'] });
        });

        // Cleanup
        return () => {
            socket.off('order.created');
            socket.off('order.updated');
            socket.off('order.status_changed');
            socket.off('table.updated');
            // We don't disconnect here because other components might use the socket
            // disconnectSocket() is called explicitly on logout or similar if needed
            // But strict mode might cause issues, so we just remove listeners
        };
    }, [token, queryClient, message, notification]);
};
