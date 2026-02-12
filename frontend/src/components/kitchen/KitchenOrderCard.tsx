
import React from 'react';
import { Card, Tag, Button, List } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, FireOutlined } from '@ant-design/icons';
import { Order } from '@/hooks/use-orders';

interface KitchenOrderCardProps {
    order: Order;
    onUpdateItemStatus: (orderId: string, itemId: string, status: string) => void;
}

export const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({ order, onUpdateItemStatus }) => {
    // Calculate elapsed time (simple version, could be dynamic)
    const elapsedMinutes = Math.floor((new Date().getTime() - new Date(order.openedAt).getTime()) / 60000);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'default';
            case 'preparing': return 'orange';
            case 'ready': return 'success';
            case 'delivered': return 'blue';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendente';
            case 'preparing': return 'Preparando';
            case 'ready': return 'Pronto';
            case 'delivered': return 'Entregue';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const handleItemClick = (item: any) => {
        let nextStatus = 'pending';
        if (item.status === 'pending') nextStatus = 'preparing';
        else if (item.status === 'preparing') nextStatus = 'ready';
        else if (item.status === 'ready') nextStatus = 'delivered'; // Optional: could just stay ready

        onUpdateItemStatus(order.id, item.id, nextStatus);
    };

    return (
        <Card
            className="w-full shadow-md border-t-4 border-gray-200"
            style={{
                borderTopColor: elapsedMinutes > 30 ? '#ef4444' : elapsedMinutes > 15 ? '#eab308' : '#3b82f6'
            }}
            title={
                <div className="flex justify-between items-center text-sm md:text-base">
                    <span className="font-bold">#{order.orderNumber}</span>
                    <span>
                        {order.table ? `Mesa ${order.table.tableNumber}` : order.orderType === 'delivery' ? 'Delivery' : 'Balcão'}
                    </span>
                </div>
            }
            extra={
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <ClockCircleOutlined />
                    <span>{elapsedMinutes} min</span>
                </div>
            }
            size="small"
        >
            <List
                dataSource={order.items}
                renderItem={(item) => (
                    <div
                        key={item.id}
                        className={`p-2 mb-2 rounded border cursor-pointer hover:bg-gray-50 transition-colors ${item.status === 'ready' ? 'bg-green-50 border-green-200' :
                                item.status === 'preparing' ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
                            }`}
                        onClick={() => handleItemClick(item)}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex gap-2">
                                <span className="font-bold bg-gray-100 px-2 rounded h-fit">{item.quantity}x</span>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-800">{item.product.name}</span>
                                    {item.notes && (
                                        <span className="text-xs text-red-600 font-semibold bg-red-50 px-1 rounded mt-1 w-fit">
                                            ⚠️ {item.notes}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Tag color={getStatusColor(item.status)} className="m-0 text-xs">
                                {getStatusLabel(item.status)}
                            </Tag>
                        </div>
                    </div>
                )}
            />

            {order.notes && (
                <div className="mt-2 bg-yellow-50 p-2 rounded text-xs text-yellow-800 border border-yellow-200">
                    📝 {order.notes}
                </div>
            )}

            <div className="mt-2 text-xs text-gray-400 text-right">
                Garçom: {order.waiter?.fullName || 'N/A'}
            </div>
        </Card>
    );
};
