
'use client';

import React from 'react';
import { useKitchen } from '@/hooks/use-kitchen';
import { KitchenOrderCard } from '@/components/kitchen/KitchenOrderCard';
import { Badge, Button, Spin, Empty } from 'antd';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function KitchenPage() {
    const { activeOrders, isConnected, isLoading, updateItemStatus, refresh } = useKitchen();

    const handleUpdateItemStatus = (orderId: string, itemId: string, status: string) => {
        updateItemStatus(orderId, itemId, status);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800 m-0">👨‍🍳 Cozinha (KDS)</h1>
                    <Badge
                        status={isConnected ? 'success' : 'error'}
                        text={
                            <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-500'}`}>
                                {isConnected ? 'Online' : 'Desconectado'}
                            </span>
                        }
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-gray-500 text-sm hidden md:block">
                        {activeOrders.length} pedidos pendentes
                    </div>
                    <Button
                        icon={<RefreshCw size={16} />}
                        onClick={refresh}
                        loading={isLoading}
                    >
                        Atualizar
                    </Button>
                </div>
            </div>

            {/* Orders Grid */}
            {isLoading && activeOrders.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" tip="Carregando pedidos..." />
                </div>
            ) : activeOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {activeOrders.map(order => (
                        <KitchenOrderCard
                            key={order.id}
                            order={order}
                            onUpdateItemStatus={handleUpdateItemStatus}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm">
                    <div className="bg-green-50 p-6 rounded-full mb-4">
                        <CheckCircleIcon size={48} className="text-green-500" />
                    </div>
                    <h2 className="text-xl font-medium text-gray-700">Tudo limpo!</h2>
                    <p className="text-gray-500">Nenhum pedido pendente na cozinha.</p>
                </div>
            )}
        </div>
    );
}

const CheckCircleIcon = ({ size, className }: { size?: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
