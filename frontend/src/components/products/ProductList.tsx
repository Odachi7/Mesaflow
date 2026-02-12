import React from 'react';
import { Table, Button, Tag, Space, Popconfirm, Tooltip, Avatar } from 'antd';
import { Edit, Trash2, Package } from 'lucide-react';
import { Product, Category } from '@/types/catalog';
import type { ColumnsType } from 'antd/es/table';

interface ProductListProps {
    products: Product[];
    loading: boolean;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
    products,
    loading,
    onEdit,
    onDelete
}) => {
    const columns: ColumnsType<Product> = [
        {
            title: 'Imagem',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 80,
            render: (url) => (
                <Avatar
                    shape="square"
                    size={48}
                    src={url}
                    icon={<Package className="w-6 h-6 text-gray-400" />}
                    className="bg-gray-100 flex items-center justify-center"
                />
            ),
        },
        {
            title: 'Nome',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <div className="flex flex-col">
                    <span className="font-medium">{text}</span>
                    <span className="text-xs text-gray-500">{record.category?.name || 'Sem categoria'}</span>
                </div>
            ),
        },
        {
            title: 'Preço',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            sorter: (a, b) => a.price - b.price,
            render: (price) => `R$ ${Number(price).toFixed(2)}`,
        },
        {
            title: 'Disponível',
            dataIndex: 'isAvailable',
            key: 'isAvailable',
            width: 100,
            render: (isAvailable: boolean) => (
                <Tag color={isAvailable ? 'blue' : 'volcano'}>
                    {isAvailable ? 'Sim' : 'Não'}
                </Tag>
            ),
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
                            title="Excluir produto"
                            description="Tem certeza que deseja excluir este produto?"
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
            dataSource={products}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
        />
    );
};

export default ProductList;
