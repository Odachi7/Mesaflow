'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from 'antd';
import {
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Calendar,
    FileText,
    Package
} from 'lucide-react';

export default function DashboardPage() {
    // Mock data - será substituído por dados reais da API
    const stats = [
        {
            title: "Pedidos de Hoje",
            value: 156,
            trend: '+12%',
            isPositive: true,
            subtitle: 'desde ontem'
        },
        {
            title: 'Receita',
            value: 'R$ 12.450',
            trend: '+8%',
            isPositive: true,
            subtitle: 'desde ontem'
        },
        {
            title: 'Mesas Ativas',
            value: '24/50',
            trend: '3 aguardando',
            isPositive: false,
            subtitle: 'pagamento'
        },
    ];

    const recentActivity = [
        { icon: '📦', text: 'Pedido #1234 pronto para retirada', time: 'há 2 min' },
        { icon: '🪑', text: 'Mesa 5 reservada para 4 pessoas às 19:00', time: 'há 15 min' },
        { icon: '🍅', text: 'Ingrediente "Molho de Tomate" em estoque baixo', time: 'há 1 hora' },
        { icon: '👤', text: 'Novo perfil de cliente criado: Sarah L.', time: 'há 2 horas' },
    ];

    const quickActions = [
        { label: 'Novo Pedido', icon: Plus, color: 'from-blue-600 to-blue-700' },
        { label: 'Reservar Mesa', icon: Calendar, color: 'from-blue-600 to-blue-700' },
        { label: 'Adicionar Produto', icon: Package, color: 'from-blue-600 to-blue-700' },
        { label: 'Gerar Relatório', icon: FileText, color: 'from-blue-600 to-blue-700' },
    ];

    return (
        <MainLayout title="Dashboard">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                            <div className="text-sm text-gray-500">{stat.title}</div>
                            <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
                            <div className="flex items-center gap-1 text-sm">
                                {stat.isPositive ? (
                                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                                ) : (
                                    <ArrowDownRight className="w-4 h-4 text-orange-500" />
                                )}
                                <span className={stat.isPositive ? 'text-green-600' : 'text-orange-600'}>
                                    {stat.trend}
                                </span>
                                <span className="text-gray-500">{stat.subtitle}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card title="Atividade Recente" className="shadow-sm">
                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                <span className="text-2xl">{activity.icon}</span>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-700">{activity.text}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title="Ações Rápidas" className="shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={index}
                                    className={`h-24 bg-gradient-to-r ${action.color} hover:opacity-90 transition-opacity rounded-lg shadow-md hover:shadow-lg flex flex-col items-center justify-center gap-2 text-white font-semibold`}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="text-sm">{action.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
