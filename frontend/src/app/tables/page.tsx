'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TableCard, { Table } from '@/components/tables/TableCard';
import TableFormModal from '@/components/tables/TableFormModal';
import { Button, FloatButton, Select, Input, Empty } from 'antd';
import { Plus, Search } from 'lucide-react';
import { App } from 'antd';
import { useTables } from '@/hooks/use-tables';
import { Loading } from '@/components/ui';

export default function TablesPage() {
    const { message, modal } = App.useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    const {
        tables,
        isLoading,
        createTable,
        updateTable,
        deleteTable,
        isCreating,
        isUpdating,
    } = useTables();

    const filteredTables = tables.filter((table) => {
        const matchesSearch = table.tableNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleView = (table: Table) => {
        message.info(`Visualizando Mesa ${table.tableNumber}`);
    };

    const handleEdit = (table: Table) => {
        setSelectedTable(table);
        setIsModalOpen(true);
    };

    const handleDelete = (table: Table) => {
        modal.confirm({
            title: 'Confirmar Exclusão',
            content: `Tem certeza que deseja excluir a Mesa ${table.tableNumber}?`,
            okText: 'Sim, excluir',
            cancelText: 'Cancelar',
            okButtonProps: { danger: true },
            onOk: () => {
                deleteTable(table.id);
            },
        });
    };

    const handleCreateNew = () => {
        setSelectedTable(null);
        setIsModalOpen(true);
    };

    const handleModalSubmit = (values: any) => {
        if (selectedTable) {
            updateTable({ id: selectedTable.id, ...values });
        } else {
            createTable(values);
        }
        setIsModalOpen(false);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedTable(null);
    };

    if (isLoading) {
        return (
            <MainLayout title="Mesas">
                <Loading fullScreen tip="Carregando mesas..." />
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Mesas">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        prefix={<Search className="w-4 h-4 text-gray-400" />}
                        placeholder="Buscar mesa por número..."
                        size="large"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select
                    size="large"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    className="w-full md:w-48"
                    options={[
                        { label: 'Todos os Status', value: 'all' },
                        { label: 'Disponível', value: 'available' },
                        { label: 'Ocupada', value: 'occupied' },
                        { label: 'Reservada', value: 'reserved' },
                        { label: 'Manutenção', value: 'maintenance' },
                    ]}
                />
                <Button
                    type="primary"
                    size="large"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={handleCreateNew}
                    className="w-full md:w-auto"
                >
                    Nova Mesa
                </Button>
            </div>

            {/* Tables Grid */}
            {filteredTables.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTables.map((table) => (
                        <TableCard
                            key={table.id}
                            table={table}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-64">
                    <Empty description="Nenhuma mesa encontrada" />
                </div>
            )}

            {/* Floating Action Button */}
            <FloatButton
                icon={<Plus />}
                type="primary"
                tooltip="Nova Mesa"
                onClick={handleCreateNew}
                className="shadow-lg"
            />

            {/* Create/Edit Modal */}
            <TableFormModal
                open={isModalOpen}
                table={selectedTable}
                onClose={handleModalClose}
                onSubmit={handleModalSubmit}
                isLoading={isCreating || isUpdating}
            />
        </MainLayout>
    );
}
