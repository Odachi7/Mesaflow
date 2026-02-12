
'use client';

import React from 'react';
import { useDashboard, TopProduct, RecentActivity } from '@/hooks/use-dashboard';
import { Card, Statistic, Row, Col, Table, List, Tag, Spin, Avatar, Button } from 'antd';
import {
    DollarSign, ShoppingBag, Users, Clock,
    TrendingUp, ArrowUpRight, Utensils
} from 'lucide-react';

export default function DashboardPage() {
    const { overview, topProducts, recentActivity, isLoading } = useDashboard();

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spin size="large" tip="Carregando dashboard..." />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <TrendingUp className="text-blue-600" />
                Dashboard
            </h1>

            {/* Overview Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Vendas Hoje"
                            value={overview?.salesToday}
                            precision={2}
                            prefix={<DollarSign size={20} className="text-green-500 mr-2" />}
                            suffix="BRL"
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Total de Pedidos"
                            value={overview?.ordersCount}
                            prefix={<ShoppingBag size={20} className="text-blue-500 mr-2" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Pedidos Ativos"
                            value={overview?.activeOrders}
                            prefix={<Clock size={20} className="text-orange-500 mr-2" />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Mesas Ocupadas"
                            value={overview?.occupiedTables}
                            prefix={<Users size={20} className="text-purple-500 mr-2" />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                {/* Top Products */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<div className="flex items-center gap-2"><Utensils size={18} /> Produtos Mais Vendidos</div>}
                        bordered={false}
                        className="shadow-sm h-full"
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={topProducts}
                            renderItem={(item: TopProduct, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                style={{ backgroundColor: index < 3 ? '#ffec3d' : '#f0f0f0', color: index < 3 ? '#cf1322' : '#595959' }}
                                            >
                                                {index + 1}
                                            </Avatar>
                                        }
                                        title={<span className="font-medium">{item.name}</span>}
                                        description={`${item.quantity} unidades vendidas`}
                                    />
                                    <div className="text-right">
                                        <div className="font-bold text-gray-700">R$ {item.total.toFixed(2)}</div>
                                        <div className="text-xs text-gray-400">R$ {item.price.toFixed(2)} un.</div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* Recent Activity */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<div className="flex items-center gap-2"><Clock size={18} /> Atividade Recente</div>}
                        bordered={false}
                        className="shadow-sm h-full"
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={recentActivity}
                            renderItem={(item: RecentActivity) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={
                                            <div className="flex justify-between">
                                                <span className="font-medium">Pedido #{item.orderNumber}</span>
                                                <small className="text-gray-400">{new Date(item.openedAt).toLocaleTimeString()}</small>
                                            </div>
                                        }
                                        description={
                                            <div className="flex items-center gap-2 mt-1">
                                                <Tag color={
                                                    item.status === 'open' ? 'blue' :
                                                        item.status === 'ready' ? 'green' :
                                                            item.status === 'closed' ? 'default' : 'orange'
                                                }>
                                                    {item.status.toUpperCase()}
                                                </Tag>
                                                {item.table && <Tag>Mesa {item.table.tableNumber}</Tag>}
                                                {item.customerName && <span className="text-xs text-gray-500">• {item.customerName}</span>}
                                            </div>
                                        }
                                    />
                                    <div className="font-bold text-gray-700">R$ {Number(item.total).toFixed(2)}</div>
                                </List.Item>
                            )}
                        />
                        <div className="mt-4 text-center">
                            <Button type="link" href="/orders" icon={<ArrowUpRight size={14} />}>
                                Ver todos os pedidos
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
