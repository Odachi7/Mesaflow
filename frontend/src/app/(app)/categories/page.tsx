'use client';

import React, { useState } from 'react';
import { Button, Table, Tag, Space, Tooltip, Popconfirm, Card } from 'antd';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useCategories, Category } from '@/hooks/use-categories';
import { CategoryFormModal } from '@/components/categories/CategoryFormModal';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const {
        categories,
        isLoading,
        createCategory,
        updateCategory,
        deleteCategory,
        isCreating,
        isUpdating,
        isDeleting
    } = useCategories();

    const handleCreate = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        deleteCategory(id);
    };

    const handleFormSubmit = (values: any) => {
        if (selectedCategory) {
            updateCategory({ id: selectedCategory.id, ...values }, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            createCategory(values, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const columns = [
        {
            title: 'Ordem',
            dataIndex: 'displayOrder',
            key: 'displayOrder',
            width: 80,
            sorter: (a: Category, b: Category) => a.displayOrder - b.displayOrder,
        },
        {
            title: 'Nome',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span className="font-medium">{text}</span>,
        },
        {
            title: 'Descrição',
            dataIndex: 'description',
            key: 'description',
            responsive: ['md'],
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 100,
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Ativo' : 'Inativo'}
                </Tag>
            ),
        },
        {
            title: 'Ações',
            key: 'actions',
            width: 120,
            render: (_: any, record: Category) => (
                <Space>
                    <Tooltip title="Editar">
                        <Button
                            type="text"
                            icon={<Edit size={16} className="text-blue-600" />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Excluir categoria?"
                        description="Isso pode afetar produtos vinculados."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Sim, excluir"
                        cancelText="Cancelar"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Excluir">
                            <Button
                                type="text"
                                danger
                                icon={<Trash2 size={16} />}
                                loading={isDeleting}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button
                        icon={<ArrowLeft size={18} />}
                        type="text"
                        onClick={() => router.back()}
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
                        <p className="text-gray-500">Gerencie as categorias do seu cardápio</p>
                    </div>
                </div>
                <Button
                    type="primary"
                    icon={<Plus size={18} />}
                    className="bg-blue-600"
                    onClick={handleCreate}
                >
                    Nova Categoria
                </Button>
            </div>

            <Card className="shadow-sm border-gray-100" bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns as any}
                    dataSource={categories}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: 'Nenhuma categoria encontrada' }}
                />
            </Card>

            <CategoryFormModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                isLoading={isCreating || isUpdating}
                category={selectedCategory}
            />
        </div>
    );
}
