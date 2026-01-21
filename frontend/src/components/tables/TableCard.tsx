import React from 'react';
import { Card, Badge, Dropdown } from 'antd';
import { Grid, Eye, Edit, Trash2, MoreVertical, Users } from 'lucide-react';
import type { MenuProps } from 'antd';

export interface Table {
    id: string;
    tableNumber: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    qrCode?: string;
}

interface TableCardProps {
    table: Table;
    onView: (table: Table) => void;
    onEdit: (table: Table) => void;
    onDelete: (table: Table) => void;
}

const statusConfig = {
    available: {
        label: 'Disponível',
        color: 'success',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
    },
    occupied: {
        label: 'Ocupada',
        color: 'error',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
    },
    reserved: {
        label: 'Reservada',
        color: 'warning',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
    },
    maintenance: {
        label: 'Manutenção',
        color: 'default',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
    },
};

export default function TableCard({ table, onView, onEdit, onDelete }: TableCardProps) {
    const config = statusConfig[table.status];

    const menuItems: MenuProps['items'] = [
        {
            key: 'view',
            label: 'Ver Detalhes',
            icon: <Eye className="w-4 h-4" />,
            onClick: () => onView(table),
        },
        {
            key: 'edit',
            label: 'Editar',
            icon: <Edit className="w-4 h-4" />,
            onClick: () => onEdit(table),
        },
        {
            type: 'divider',
        },
        {
            key: 'delete',
            label: 'Deletar',
            icon: <Trash2 className="w-4 h-4" />,
            danger: true,
            onClick: () => onDelete(table),
        },
    ];

    return (
        <Card
            className={`${config.bgColor} border-2 ${config.borderColor} hover:shadow-lg transition-all cursor-pointer`}
            bodyStyle={{ padding: '16px' }}
        >
            <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Grid className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-lg text-slate-800">Mesa {table.tableNumber}</span>
                    </div>
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <button className="p-1 hover:bg-white/50 rounded transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                    </Dropdown>
                </div>

                {/* Status Badge */}
                <Badge status={config.color as any} text={config.label} className="text-sm" />

                {/* Capacity */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{table.capacity} pessoas</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                        onClick={() => onView(table)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white rounded transition-colors"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Detalhes
                    </button>
                    <button
                        onClick={() => onEdit(table)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white rounded transition-colors"
                    >
                        <Edit className="w-3.5 h-3.5" />
                        Editar
                    </button>
                    <button
                        onClick={() => onDelete(table)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-white rounded transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Deletar
                    </button>
                </div>
            </div>
        </Card>
    );
}
