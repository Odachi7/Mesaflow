'use client';

import React, { useState } from 'react';
import { Button, Input, Select, Empty, Spin } from 'antd';
import { Plus, Search, Layers, PackageX } from 'lucide-react';
import { useProducts, Product } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
    const router = useRouter();
    const { categories, isLoading: isLoadingCategories } = useCategories();

    // Filters State
    const [filters, setFilters] = useState({
        search: '',
        categoryId: 'all',
        onlyActive: undefined as boolean | undefined, // undefined shows all
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const {
        products,
        isLoading,
        createProduct,
        updateProduct,
        deleteProduct,
        toggleAvailability,
        toggleActive,
        isCreating,
        isUpdating
    } = useProducts({
        search: filters.search,
        categoryId: filters.categoryId === 'all' ? undefined : filters.categoryId,
        onlyActive: filters.onlyActive
    });

    const handleSearch = (value: string) => {
        setFilters(prev => ({ ...prev, search: value }));
    };

    const handleCategoryFilter = (value: string) => {
        setFilters(prev => ({ ...prev, categoryId: value }));
    };

    const handleStatusFilter = (value: string) => {
        let activeStatus: boolean | undefined = undefined;
        if (value === 'active') activeStatus = true;
        if (value === 'inactive') activeStatus = false;

        setFilters(prev => ({ ...prev, onlyActive: activeStatus }));
    };

    // Modal Handlers
    const openNewProductModal = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const openEditProductModal = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (values: any) => {
        if (selectedProduct) {
            updateProduct({ id: selectedProduct.id, ...values }, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            createProduct(values, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const categoryOptions = [
        { label: 'Todas as Categorias', value: 'all' },
        ...categories.map(c => ({ label: c.name, value: c.id }))
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
                    <p className="text-gray-500">Gerencie seu cardápio e itens de venda</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        icon={<Layers size={18} />}
                        onClick={() => router.push('/categories')}
                    >
                        Categorias
                    </Button>
                    <Button
                        type="primary"
                        icon={<Plus size={18} />}
                        className="bg-blue-600"
                        onClick={openNewProductModal}
                    >
                        Novo Produto
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <Input
                    placeholder="Buscar produto..."
                    prefix={<Search size={18} className="text-gray-400" />}
                    className="w-full md:w-64"
                    allowClear
                    onChange={(e) => handleSearch(e.target.value)}
                />

                <Select
                    defaultValue="all"
                    className="w-full md:w-48"
                    onChange={handleCategoryFilter}
                    options={categoryOptions}
                    loading={isLoadingCategories}
                    showSearch
                    optionFilterProp="label"
                />

                <Select
                    defaultValue="all"
                    className="w-full md:w-40"
                    onChange={handleStatusFilter}
                    options={[
                        { label: 'Todos os Status', value: 'all' },
                        { label: 'Ativos', value: 'active' },
                        { label: 'Inativos', value: 'inactive' },
                    ]}
                />

                <div className="ml-auto text-sm text-gray-500">
                    {products.length} produtos encontrados
                </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <Spin size="large" tip="Carregando produtos..." />
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={openEditProductModal}
                            onDelete={deleteProduct}
                            onToggleActive={toggleActive}
                            onToggleAvailability={toggleAvailability}
                            isLoading={isUpdating}
                        />
                    ))}
                </div>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                        <PackageX size={48} className="text-gray-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">Nenhum produto encontrado</h3>
                    <p className="text-gray-500 mb-6">Tente ajustar os filtros ou crie um novo produto.</p>
                    <Button type="primary" onClick={openNewProductModal}>
                        Cadastrar Primeiro Produto
                    </Button>
                </div>
            )}

            {/* Modal */}
            <ProductFormModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                isLoading={isCreating || isUpdating}
                product={selectedProduct}
            />
        </div>
    );
}
