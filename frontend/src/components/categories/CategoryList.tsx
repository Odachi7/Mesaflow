import React from 'react';
import { Table, Button, Tag, Space, Popconfirm, Tooltip } from 'antd';
import { Edit, Trash2 } from 'lucide-react';
import { Category } from '@/types/catalog';
import type { ColumnsType } from 'antd/es/table';

interface CategoryListProps {
    categories: Category[];
    loading: boolean;
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
    categories,
    loading,
    onEdit,
    onDelete
}) => {
    const columns: ColumnsType<Category> = [
        {
            title: 'Ordem',
            dataIndex: 'displayOrder',
            key: 'displayOrder',
            width: 80,
            sorter: (a, b) => a.displayOrder - b.displayOrder,
        },
        {
            title: 'Nome',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Descrição',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
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
            render: (_, record) => (
                <Space>
                    <Tooltip title="Editar">
                        <Button
                            type="text"
                            icon={<Edit className="w-4 h-4 text-blue-500" />}
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <Popconfirm
                            title="Excluir categoria"
                            description="Tem certeza que deseja excluir esta categoria? Produtos associados podem ficar sem categoria."
                            onConfirm={() => onDelete(record.id)}
                            okText="Sim"
                            cancelText="Não"
                        >
                            <Button
                                type="text"
                                danger
                                icon={<Trash2 className="w-4 h-4" />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={categories}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
        />
    );
};

export default CategoryList;
