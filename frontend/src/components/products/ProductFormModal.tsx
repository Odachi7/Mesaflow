import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, Button } from 'antd';
import { Upload as UploadIcon } from 'lucide-react';
import { Product } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { useRouter } from 'next/navigation';

interface ProductFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    isLoading: boolean;
    product?: Product | null;
}

const { TextArea } = Input;

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
    open,
    onClose,
    onSubmit,
    isLoading,
    product,
}) => {
    const [form] = Form.useForm();
    const router = useRouter();
    const { categories, isLoading: isLoadingCategories } = useCategories();

    useEffect(() => {
        if (open) {
            if (product) {
                form.setFieldsValue({
                    ...product,
                    categoryId: product.categoryId, // Ensure this matches user selection
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, product, form]);

    const handleFinish = (values: any) => {
        onSubmit(values);
        form.resetFields();
    };

    const categoryOptions = categories.map(cat => ({
        label: cat.name,
        value: cat.id,
    }));

    return (
        <Modal
            title={product ? `Editar Produto: ${product.name}` : 'Novo Produto'}
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
                preserve={false}
                initialValues={{
                    isAvailable: true,
                    isActive: true,
                    preparationTime: 15
                }}
            >
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="name"
                        label="Nome do Produto"
                        rules={[{ required: true, message: 'Por favor insira o nome' }]}
                        className="col-span-2"
                    >
                        <Input placeholder="Ex: X-Bacon" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="categoryId"
                        label="Categoria"
                        rules={[{ required: true, message: 'Selecione uma categoria' }]}
                        className="col-span-1"
                        help={categoryOptions.length === 0 && !isLoadingCategories ? "Nenhuma categoria cadastrada" : null}
                    >
                        <Select
                            placeholder="Selecione..."
                            options={categoryOptions}
                            loading={isLoadingCategories}
                            notFoundContent={
                                <div className="p-2 text-center">
                                    <p className="text-gray-400 text-xs mb-2">Sem categorias</p>
                                    <Button
                                        type="dashed" size="small" block
                                        onClick={() => {
                                            onClose();
                                            router.push('/categories');
                                        }}
                                    >
                                        Criar Categoria
                                    </Button>
                                </div>
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Preço de Venda"
                        rules={[{ required: true, message: 'Insira o preço' }]}
                        className="col-span-1"
                    >
                        <InputNumber<number>
                            style={{ width: '100%' }}
                            formatter={(value) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                            parser={(value) => {
                                const parsed = parseFloat(value!.replace(/\R\$\s?|(\.*)/g, '').replace(',', '.'));
                                return isNaN(parsed) ? 0 : parsed;
                            }}
                            step={0.5}
                            min={0}
                        />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Descrição"
                        className="col-span-2"
                    >
                        <TextArea rows={3} placeholder="Ingredientes, detalhes, etc..." />
                    </Form.Item>

                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        <Form.Item
                            name="costPrice"
                            label="Preço de Custo (Opcional)"
                        >
                            <InputNumber<number>
                                style={{ width: '100%' }}
                                formatter={(value) => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                parser={(value) => {
                                    const parsed = parseFloat(value!.replace(/\R\$\s?|(\.*)/g, '').replace(',', '.'));
                                    return isNaN(parsed) ? 0 : parsed;
                                }}
                                min={0}
                            />
                        </Form.Item>

                        <Form.Item
                            name="preparationTime"
                            label="Tempo de Preparo (min)"
                        >
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="imageUrl"
                        label="URL da Imagem"
                        className="col-span-2"
                        rules={[{ type: 'url', message: 'URL inválida' }]}
                        extra="Cole o link direto da imagem"
                    >
                        <Input prefix={<UploadIcon size={16} />} placeholder="https://..." />
                    </Form.Item>

                    <div className="col-span-2 flex gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <Form.Item
                            name="isAvailable"
                            valuePropName="checked"
                            label="Disponível para Venda?"
                            className="mb-0"
                        >
                            <Switch />
                        </Form.Item>

                        <Form.Item
                            name="isActive"
                            valuePropName="checked"
                            label="Produto Ativo?"
                            className="mb-0"
                        >
                            <Switch />
                        </Form.Item>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button type="primary" htmlType="submit" loading={isLoading}>
                        {product ? 'Salvar Alterações' : 'Criar Produto'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};
