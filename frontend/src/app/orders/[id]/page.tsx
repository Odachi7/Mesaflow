
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Button, Card, Descriptions, Table, Tag, Popconfirm,
    Statistic, InputNumber, Divider, Space, Spin, Alert, Modal
} from 'antd';
import {
    ArrowLeft, Plus, Trash2, Printer,
    CheckCircle, XCircle, DollarSign
} from 'lucide-react';
import { useOrder, useOrders, OrderItem } from '@/hooks/use-orders';
import { AddOrderItemModal } from '@/components/orders/AddOrderItemModal';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Fetch Order
    const { data: order, isLoading: isLoadingOrder, error } = useOrder(orderId);

    // Mutations
    const {
        addItem,
        removeItem,
        updateItemQuantity,
        closeOrder,
        cancelOrder,
        applyDiscount,
        isAddingItem
    } = useOrders();

    const handleAddItem = (values: any) => {
        addItem({
            orderId,
            productId: values.productId,
            quantity: values.quantity,
            notes: values.notes,
        }, {
            onSuccess: () => setIsAddModalOpen(false)
        });
    };

    const handleUpdateQuantity = (itemId: string, quantity: number) => {
        if (quantity < 1) return;
        updateItemQuantity({ orderId, itemId, quantity });
    };

    const handleRemoveItem = (itemId: string) => {
        removeItem({ orderId, itemId });
    };

    const handleCloseOrder = () => {
        closeOrder(orderId);
    };

    const handleCancelOrder = () => {
        cancelOrder(orderId);
    };

    const handleApplyDiscount = () => {
        let discountValue = 0;
        Modal.confirm({
            title: 'Aplicar Desconto',
            content: (
                <div className="pt-2">
                    <p className="mb-2">Informe o valor do desconto em R$:</p>
                    <InputNumber
                        min={0}
                        step={0.5}
                        autoFocus
                        style={{ width: '100%' }}
                        onChange={(val) => { discountValue = Number(val); }}
                        defaultValue={0}
                        formatter={value => `R$ ${value}`}
                        parser={value => value!.replace('R$ ', '') as any}
                    />
                </div>
            ),
            onOk: () => {
                applyDiscount({ orderId, discount: discountValue });
            },
            okText: 'Aplicar',
            cancelText: 'Cancelar',
        });
    };

    if (isLoadingOrder) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spin size="large" tip="Carregando detalhes do pedido..." />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-8">
                <Alert
                    message="Erro ao carregar pedido"
                    description="Não foi possível encontrar o pedido solicitado."
                    type="error"
                    showIcon
                    action={
                        <Button onClick={() => router.push('/orders')}>
                            Voltar para Pedidos
                        </Button>
                    }
                />
            </div>
        );
    }

    const isClosed = order.status === 'closed' || order.status === 'cancelled';

    const renderStatusTag = (status: string) => {
        const colors: Record<string, string> = {
            'open': 'processing',
            'closed': 'success',
            'cancelled': 'error',
        };
        const labels: Record<string, string> = {
            'open': 'Aberto',
            'closed': 'Fechado',
            'cancelled': 'Cancelado',
        };
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
    };

    const columns = [
        {
            title: 'Produto',
            dataIndex: ['product', 'name'],
            key: 'product',
            render: (text: string, record: OrderItem) => (
                <div>
                    <div className="font-medium">{text}</div>
                    {record.notes && <div className="text-xs text-gray-500 italic">Obs: {record.notes}</div>}
                </div>
            )
        },
        {
            title: 'Qtd.',
            key: 'quantity',
            width: 120,
            render: (_: any, record: OrderItem) => (
                isClosed ? (
                    <span>{record.quantity}</span>
                ) : (
                    <InputNumber
                        min={1}
                        value={record.quantity}
                        onChange={(val) => val && handleUpdateQuantity(record.id, val)}
                        size="small"
                    />
                )
            )
        },
        {
            title: 'Preço Un.',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            render: (val: number) => `R$ ${val.toFixed(2)}`,
        },
        {
            title: 'Subtotal',
            dataIndex: 'subtotal',
            key: 'subtotal',
            render: (val: number) => <span className="font-bold">R$ {Number(val).toFixed(2)}</span>,
        },
        {
            title: 'Ações',
            key: 'actions',
            width: 80,
            render: (_: any, record: OrderItem) => !isClosed && (
                <Popconfirm
                    title="Remover item?"
                    onConfirm={() => handleRemoveItem(record.id)}
                    okText="Sim"
                    cancelText="Não"
                    okButtonProps={{ danger: true }}
                >
                    <Button type="text" danger icon={<Trash2 size={16} />} />
                </Popconfirm>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button
                        icon={<ArrowLeft size={18} />}
                        type="text"
                        onClick={() => router.push('/orders')}
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-800">Pedido #{order.orderNumber}</h1>
                            {renderStatusTag(order.status)}
                        </div>
                        <p className="text-gray-500">
                            Aberto em {new Date(order.openedAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                <Space>
                    {!isClosed && (
                        <Button
                            danger
                            icon={<XCircle size={18} />}
                            onClick={() => {
                                Modal.confirm({
                                    title: 'Cancelar Pedido?',
                                    content: 'Tem certeza que deseja cancelar este pedido? Essa ação não pode ser desfeita.',
                                    okText: 'Sim, Cancelar',
                                    okType: 'danger',
                                    cancelText: 'Voltar',
                                    onOk: handleCancelOrder
                                });
                            }}
                        >
                            Cancelar
                        </Button>
                    )}
                    <Button icon={<Printer size={18} />}>Imprimir</Button>
                </Space>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <Card
                        title="Itens do Pedido"
                        extra={
                            !isClosed && (
                                <Button
                                    type="primary"
                                    icon={<Plus size={16} />}
                                    onClick={() => setIsAddModalOpen(true)}
                                >
                                    Adicionar Item
                                </Button>
                            )
                        }
                    >
                        <Table
                            columns={columns as any}
                            dataSource={order.items || []}
                            rowKey="id"
                            pagination={false}
                            locale={{ emptyText: 'Nenhum item adicionado' }}
                        />
                    </Card>

                    <Card title="Informações Adicionais" size="small">
                        <Descriptions column={{ xs: 1, sm: 2 }}>
                            <Descriptions.Item label="Mesa">
                                {order.table ? `Mesa ${order.table.tableNumber}` : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Cliente">
                                {order.customer?.name || order.customerName || 'Não identificado'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Garçom">
                                {order.waiter?.fullName || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tipo">
                                {order.orderType === 'dine_in' ? 'Mesa' :
                                    order.orderType === 'takeaway' ? 'Para Viagem' : 'Delivery'}
                            </Descriptions.Item>
                            {order.notes && (
                                <Descriptions.Item label="Observações" span={2}>
                                    {order.notes}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                </div>

                {/* Right Column - Summary & Actions */}
                <div className="space-y-6">
                    <Card title="Resumo Financeiro">
                        <div className="space-y-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>R$ {Number(order.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Desconto</span>
                                <span className="text-red-500">- R$ {Number(order.discount).toFixed(2)}</span>
                            </div>

                            {!isClosed && (
                                <div className="flex justify-end">
                                    <Button
                                        type="link"
                                        size="small"
                                        icon={<DollarSign size={14} />}
                                        onClick={handleApplyDiscount}
                                    >
                                        Alterar Desconto
                                    </Button>
                                </div>
                            )}
                            {/* Tax is hidden/optional in simplified view, can be added if needed */}
                            {/* <div className="flex justify-between text-gray-600">
                                <span>Taxa de Serviço</span>
                                <span>R$ {Number(order.tax).toFixed(2)}</span>
                            </div> */}

                            <Divider className="my-2" />

                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-800">Total</span>
                                <span className="text-2xl font-bold text-blue-600">
                                    R$ {Number(order.total).toFixed(2)}
                                </span>
                            </div>

                            {!isClosed ? (
                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    icon={<CheckCircle size={20} />}
                                    className="bg-green-600 hover:bg-green-700 mt-4 h-12"
                                    onClick={() => {
                                        Modal.confirm({
                                            title: 'Fechar Pedido?',
                                            content: `Confirma o fechamento do pedido no valor de R$ ${Number(order.total).toFixed(2)}?`,
                                            okText: 'Confirmar Fechamento',
                                            cancelText: 'Voltar',
                                            onOk: handleCloseOrder
                                        });
                                    }}
                                >
                                    Fechar e Cobrar
                                </Button>
                            ) : (
                                <Alert
                                    message="Pedido Fechado"
                                    type="success"
                                    showIcon
                                    className="mt-4"
                                />
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            <AddOrderItemModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddItem}
                isLoading={isAddingItem}
            />
        </div>
    );
}
