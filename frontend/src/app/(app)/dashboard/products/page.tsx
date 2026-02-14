'use client';

import React, { useState } from 'react';

import { Button, message, Input, Select } from 'antd';
import { Plus, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import ProductList from '@/components/products/ProductList';
import ProductModal from '@/components/products/ProductModal';
import { Product, Category, CreateProductDto, UpdateProductDto } from '@/types/catalog';

export default function ProductsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
    const queryClient = useQueryClient();

    // Fetch Products
    const { data: products = [], isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products', selectedCategory],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (selectedCategory) params.append('categoryId', selectedCategory);
            const response = await api.get<Product[]>(`/products?${params.toString()}`);
            return response.data;
        },
    });

    // Fetch Categories (for filter and modal)
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get<Category[]>('/categories?includeInactive=true');
            return response.data;
        },
    });

    // Create Product
    const createMutation = useMutation({
        mutationFn: async (data: CreateProductDto) => {
            const response = await api.post('/products', data);
            return response.data;
        },
        onSuccess: () => {
            message.success('Produto criado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            handleCloseModal();
        },
        onError: (error) => {
            message.error('Erro ao criar produto');
            console.error(error);
        }
    });

    // Update Product
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateProductDto }) => {
            const response = await api.patch(`/products/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            message.success('Produto atualizado com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            handleCloseModal();
        },
        onError: (error) => {
            message.error('Erro ao atualizar produto');
            console.error(error);
        }
    });

    // Delete Product
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/products/${id}`);
        },
        onSuccess: () => {
            message.success('Produto excluído com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error: any) => {
            if (error.response?.status === 409) {
                message.error('Não é possível excluir: produto possui pedidos vinculados.');
            } else {
                message.error('Erro ao excluir produto');
            }
        }
    });

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
        } else {
            setEditingProduct(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSubmit = (values: CreateProductDto | UpdateProductDto) => {
        if (editingProduct) {
            updateMutation.mutate({ id: editingProduct.id, data: values });
        } else {
            createMutation.mutate(values as CreateProductDto);
        }
    };

    const filteredProducts = products.filter(prod =>
        prod.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-4 w-full sm:w-auto">
                    <Input
                        prefix={<Search className="w-4 h-4 text-gray-400" />}
                        placeholder="Buscar produtos..."
                        className="max-w-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Select
                        placeholder="Filtrar por Categoria"
                        allowClear
                        style={{ width: 200 }}
                        onChange={(value) => setSelectedCategory(value)}
                        value={selectedCategory}
                    >
                        {categories.map(cat => (
                            <Select.Option key={cat.id} value={cat.id}>
                                {cat.name}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <Button
                    type="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Novo Produto
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <ProductList
                    products={filteredProducts}
                    loading={isLoadingProducts}
                    onEdit={handleOpenModal}
                    onDelete={(id) => deleteMutation.mutate(id)}
                />
            </div>

            <ProductModal
                open={isModalOpen}
                onCancel={handleCloseModal}
                onSubmit={handleSubmit}
                initialValues={editingProduct}
                categories={categories}
                loading={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
