
import React, { useState } from 'react';
import { Modal, Form, Select, InputNumber, Input, Button, List, Avatar, Spin, Empty } from 'antd';
import { useProducts, Product } from '@/hooks/use-products';
import { Search } from 'lucide-react';

interface AddOrderItemModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    isLoading: boolean;
}

const { Option } = Select;
const { TextArea } = Input;

export const AddOrderItemModal: React.FC<AddOrderItemModalProps> = ({
    open,
    onClose,
    onSubmit,
    isLoading,
}) => {
    const [form] = Form.useForm();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const { products, isLoading: isLoadingProducts } = useProducts({
        search: searchTerm,
        onlyActive: true,
        onlyAvailable: true,
    });

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const handleSelectProduct = (productId: string) => {
        const product = products.find(p => p.id === productId);
        setSelectedProduct(product || null);
    };

    const handleFinish = (values: any) => {
        onSubmit({
            productId: values.productId,
            quantity: values.quantity,
            notes: values.notes,
        });
        form.resetFields();
        setSelectedProduct(null);
        setSearchTerm('');
    };

    return (
        <Modal
            title="Adicionar Item ao Pedido"
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{ quantity: 1 }}
                preserve={false}
            >
                <Form.Item
                    name="productId"
                    label="Buscar Produto"
                    rules={[{ required: true, message: 'Selecione um produto' }]}
                >
                    <Select
                        showSearch
                        placeholder="Digite o nome do produto..."
                        defaultActiveFirstOption={false}
                        showArrow={false}
                        filterOption={false}
                        onSearch={handleSearch}
                        onChange={handleSelectProduct}
                        notFoundContent={isLoadingProducts ? <Spin size="small" /> : <Empty description="Nenhum produto encontrado" />}
                        className="w-full"
                        size="large"
                    >
                        {products.map(product => (
                            <Option key={product.id} value={product.id}>
                                <div className="flex justify-between items-center w-full">
                                    <span>{product.name}</span>
                                    <span className="font-semibold text-green-600">
                                        R$ {Number(product.price).toFixed(2)}
                                    </span>
                                </div>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {selectedProduct && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                        <div className="flex gap-4">
                            {selectedProduct.imageUrl && (
                                <img
                                    src={selectedProduct.imageUrl}
                                    alt={selectedProduct.name}
                                    className="w-16 h-16 object-cover rounded-md"
                                />
                            )}
                            <div>
                                <h4 className="font-bold text-gray-800">{selectedProduct.name}</h4>
                                <p className="text-sm text-gray-500">{selectedProduct.description}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                    <Form.Item
                        name="quantity"
                        label="Quantidade"
                        rules={[{ required: true, message: 'Informe a quantidade' }]}
                    >
                        <InputNumber min={1} max={99} style={{ width: '100%' }} size="large" />
                    </Form.Item>

                    <div className="col-span-2">
                        <Form.Item
                            name="notes"
                            label="Observações (Opcional)"
                        >
                            <Input placeholder="Ex: Sem cebola, bem passado..." size="large" />
                        </Form.Item>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button type="primary" htmlType="submit" loading={isLoading}>
                        Adicionar ao Pedido
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};
