'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button, message, Input } from 'antd';
import { Plus, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import CategoryList from '@/components/categories/CategoryList';
import CategoryModal from '@/components/categories/CategoryModal';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/catalog';

export default function CategoriesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    // Fetch Categories
    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get<Category[]>('/categories?includeInactive=true');
            return response.data;
        },
    });

    // Create Category
    const createMutation = useMutation({
        mutationFn: async (data: CreateCategoryDto) => {
            const response = await api.post('/categories', data);
            return response.data;
        },
        onSuccess: () => {
            message.success('Categoria criada com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            handleCloseModal();
        },
        onError: (error) => {
            message.error('Erro ao criar categoria');
            console.error(error);
        }
    });

    // Update Category
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryDto }) => {
            const response = await api.patch(`/categories/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            message.success('Categoria atualizada com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            handleCloseModal();
        },
        onError: (error) => {
            message.error('Erro ao atualizar categoria');
            console.error(error);
        }
    });

    // Delete Category
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/categories/${id}`);
        },
        onSuccess: () => {
            message.success('Categoria excluída com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error: any) => {
            if (error.response?.status === 409) {
                message.error('Não é possível excluir: existem produtos nesta categoria.');
            } else {
                message.error('Erro ao excluir categoria');
            }
        }
    });

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
        } else {
            setEditingCategory(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleSubmit = (values: CreateCategoryDto | UpdateCategoryDto) => {
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data: values });
        } else {
            createMutation.mutate(values as CreateCategoryDto);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MainLayout title="Categorias">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Input
                    prefix={<Search className="w-4 h-4 text-gray-400" />}
                    placeholder="Buscar categorias..."
                    className="max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button
                    type="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Nova Categoria
                </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <CategoryList
                    categories={filteredCategories}
                    loading={isLoading}
                    onEdit={handleOpenModal}
                    onDelete={(id) => deleteMutation.mutate(id)}
                />
            </div>

            <CategoryModal
                open={isModalOpen}
                onCancel={handleCloseModal}
                onSubmit={handleSubmit}
                initialValues={editingCategory}
                loading={createMutation.isPending || updateMutation.isPending}
            />
        </MainLayout>
    );
}
