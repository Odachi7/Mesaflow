
import React from 'react';
import { Card, Tag, Button, Statistic, Divider, Space } from 'antd';
import { ClockCircleOutlined, UserOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Order } from '@/hooks/use-orders';
import { useRouter } from 'next/navigation';

interface OrderCardProps {
    order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
    const router = useRouter();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'processing';
            case 'closed': return 'success';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'Aberto';
            case 'closed': return 'Fechado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const itemCount = order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    return (
        <Card
            hoverable
            className="w-full shadow-sm hover:shadow-md transition-shadow border-gray-200 rounded-xl overflow-hidden"
            onClick={() => router.push(`/orders/${order.id}`)}
            title={
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">#{order.orderNumber}</span>
                    <Tag color={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                    </Tag>
                </div>
            }
            extra={
                order.table ? (
                    <Tag color="geekblue" className="mr-0 font-medium">
                        Mesa {order.table.tableNumber}
                    </Tag>
                ) : (
                    <Tag color="purple" className="mr-0 font-medium">
                        Balcão
                    </Tag>
                )
            }
        >
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-gray-500 text-sm">
                    <div className="flex items-center gap-1">
                        <ClockCircleOutlined />
                        <span>{new Date(order.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <UserOutlined />
                        <span className="truncate max-w-[100px]" title={order.customer?.name || 'Cliente não ident.'}>
                            {order.customer?.name || 'Inválido'}
                        </span>
                    </div>
                </div>

                <Divider className="my-2" />

                <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase tracking-wide">Total</span>
                        <span className="text-xl font-bold text-gray-800">
                            {formatCurrency(order.total)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        <ShoppingCartOutlined />
                        <span className="font-medium">{itemCount} itens</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
