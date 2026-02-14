import React from 'react';
import { Card, Tag, Switch, Button, Popconfirm, Tooltip } from 'antd';
import { Edit, Trash2, ImageOff } from 'lucide-react';
import { Product } from '@/hooks/use-products';

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    onToggleActive: (id: string) => void;
    onToggleAvailability: (id: string) => void;
    isLoading?: boolean;
}

export const ProductCard = React.memo<ProductCardProps>(({
    product,
    onEdit,
    onDelete,
    onToggleActive,
    onToggleAvailability,
    isLoading
}) => {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    return (
        <Card
            hoverable
            className={`transition-all duration-200 border-gray-200 shadow-sm hover:shadow-md ${!product.isActive ? 'opacity-75 grayscale-[0.5]' : ''}`}
            cover={
                <div className="h-40 w-full bg-gray-100 flex items-center justify-center overflow-hidden relative group">
                    {product.imageUrl ? (
                        <img
                            alt={product.name}
                            src={product.imageUrl}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                            <ImageOff size={32} strokeWidth={1.5} />
                            <span className="text-xs mt-2">Sem imagem</span>
                        </div>
                    )}

                    {!product.isAvailable && product.isActive && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="text-white font-bold px-3 py-1 border-2 border-white rounded-full text-sm">
                                INDISPONÍVEL
                            </span>
                        </div>
                    )}
                </div>
            }
            actions={[
                <Tooltip title="Disponibilidade (Venda)" key="availability">
                    <Switch
                        size="small"
                        checked={product.isAvailable}
                        onChange={() => onToggleAvailability(product.id)}
                        loading={isLoading}
                        disabled={!product.isActive}
                    />
                </Tooltip>,
                <Tooltip title="Editar" key="edit">
                    <Button
                        type="text"
                        icon={<Edit size={16} className="text-blue-600" />}
                        onClick={() => onEdit(product)}
                    />
                </Tooltip>,
                <Popconfirm
                    title="Excluir produto?"
                    description="Essa ação não pode ser desfeita."
                    onConfirm={() => onDelete(product.id)}
                    okText="Sim, excluir"
                    cancelText="Cancelar"
                    okButtonProps={{ danger: true }}
                >
                    <Tooltip title="Excluir" key="delete">
                        <Button
                            type="text"
                            danger
                            icon={<Trash2 size={16} />}
                            loading={isLoading}
                        />
                    </Tooltip>
                </Popconfirm>,
            ]}
        >
            <div className="relative">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 mr-2">
                        <h3 className="text-base font-semibold text-gray-800 line-clamp-1" title={product.name}>
                            {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]" title={product.description}>
                            {product.description || 'Sem descrição'}
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                    <div className="flex flex-col gap-1">
                        {product.category && (
                            <Tag color="blue" className="mr-0 w-fit">
                                {product.category.name}
                            </Tag>
                        )}
                        <span className="text-xs text-gray-400">
                            {product.isActive ? 'Ativo no sistema' : 'Inativo no sistema'}
                        </span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                        {formatPrice(product.price)}
                    </span>
                </div>

                {/* Status Toggle (Active/Inactive) floating top right */}
                <div className="absolute -top-[180px] right-2">
                    <Tooltip title={product.isActive ? "Produto Ativo" : "Produto Inativo"}>
                        <Switch
                            checked={product.isActive}
                            onChange={() => onToggleActive(product.id)}
                            loading={isLoading}
                            className={product.isActive ? "bg-green-500" : "bg-gray-400"}
                        />
                    </Tooltip>
                </div>
            </div>
        </Card>
    );
});

ProductCard.displayName = 'ProductCard';
