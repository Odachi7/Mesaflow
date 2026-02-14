
'use client';

import React, { useState, useMemo } from 'react';
import { Button, Input, Select, Empty, Spin } from 'antd';
import { Plus, Search, Filter } from 'lucide-react';
import { useOrders } from '@/hooks/use-orders';
import { OrderCard } from '@/components/orders/OrderCard';
import { CreateOrderModal } from '@/components/orders/CreateOrderModal';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
    const router = useRouter();

    // Filters State
    const [filters, setFilters] = useState({
        status: 'open',
        search: '',
    });

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { orders, isLoading, createOrder, isCreating } = useOrders({
        status: filters.status === 'all' ? undefined : filters.status,
    });

    const handleStatusFilter = (value: string) => {
        setFilters(prev => ({ ...prev, status: value }));
    };

    const handleCreateOrder = () => {
        setIsCreateModalOpen(true);
    };

    const handleCreateSubmit = (values: any) => {
        createOrder(values, {
            onSuccess: () => setIsCreateModalOpen(false)
        });
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            if (!filters.search) return true;
            const searchLower = filters.search.toLowerCase();
            return (
                order.orderNumber.toString().includes(searchLower) ||
                order.customer?.name.toLowerCase().includes(searchLower) ||
                order.table?.tableNumber.includes(searchLower)
            );
        });
    }, [orders, filters.search]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
                    <p className="text-gray-500">Gerencie comandas e pedidos de mesas</p>
                </div>
                <Button
                    type="primary"
                    icon={<Plus size={18} />}
                    className="bg-blue-600"
                    onClick={handleCreateOrder}
                >
                    Novo Pedido
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <Input
                    placeholder="Buscar por nº, cliente ou mesa..."
                    prefix={<Search size={18} className="text-gray-400" />}
                    className="w-full md:w-64"
                    allowClear
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />

                <Select
                    defaultValue="open"
                    className="w-full md:w-48"
                    onChange={handleStatusFilter}
                    options={[
                        { label: 'Todos os Pedidos', value: 'all' },
                        { label: 'Abertos', value: 'open' },
                        { label: 'Fechados', value: 'closed' },
                        { label: 'Cancelados', value: 'cancelled' },
                    ]}
                />

                <div className="ml-auto text-sm text-gray-500">
                    {filteredOrders.length} pedidos encontrados
                </div>
            </div>

            {/* Orders Grid */}
            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <Spin size="large" tip="Carregando pedidos..." />
                </div>
            ) : filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                        <Filter size={48} className="text-gray-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">Nenhum pedido encontrado</h3>
                    <p className="text-gray-500 mb-6">Tente ajustar os filtros ou crie um novo pedido.</p>
                </div>
            )}

            <CreateOrderModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateSubmit}
                isLoading={isCreating}
            />
        </div>
    );
}
