import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Select } from 'antd';
import { Product, Category, CreateProductDto, UpdateProductDto } from '@/types/catalog';

interface ProductModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: CreateProductDto | UpdateProductDto) => void;
    initialValues?: Product | null;
    categories: Category[];
    loading?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({
    open,
    onCancel,
    onSubmit,
    initialValues,
    categories,
    loading
}) => {
    const [form] = Form.useForm();
    const isEditing = !!initialValues;

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    categoryId: initialValues.categoryId || undefined // ensure undefined if null
                });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    isActive: true,
                    isAvailable: true
                });
            }
        }
    }, [open, initialValues, form]);

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                onSubmit(values);
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title={isEditing ? "Editar Produto" : "Novo Produto"}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Salvar"
            cancelText="Cancelar"
            width={700}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ isActive: true, isAvailable: true }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                        name="name"
                        label="Nome"
                        rules={[{ required: true, message: 'Por favor, insira o nome do produto' }]}
                        className="md:col-span-2"
                    >
                        <Input placeholder="Ex: X-Burger" />
                    </Form.Item>

                    <Form.Item
                        name="categoryId"
                        label="Categoria"
                        rules={[{ required: true, message: 'Selecione uma categoria' }]}
                    >
                        <Select placeholder="Selecione...">
                            {categories.map(cat => (
                                <Select.Option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="price"
                        label="Preço de Venda (R$)"
                        rules={[{ required: true, message: 'Insira o preço' }]}
                    >
                        <InputNumber
                            min={0}
                            precision={2}
                            style={{ width: '100%' }}
                            prefix="R$"
                        />
                    </Form.Item>

                    <Form.Item
                        name="costPrice"
                        label="Preço de Custo (R$)"
                    >
                        <InputNumber
                            min={0}
                            precision={2}
                            style={{ width: '100%' }}
                            prefix="R$"
                        />
                    </Form.Item>

                    <Form.Item
                        name="preparationTime"
                        label="Tempo de Preparo (min)"
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Descrição"
                        className="md:col-span-2"
                    >
                        <Input.TextArea rows={3} placeholder="Descrição do produto..." />
                    </Form.Item>

                    <Form.Item
                        name="imageUrl"
                        label="URL da Imagem"
                        className="md:col-span-2"
                    >
                        <Input placeholder="https://..." />
                    </Form.Item>

                    <div className="flex gap-8 md:col-span-2">
                        <Form.Item
                            name="isActive"
                            label="Ativo no Sistema"
                            valuePropName="checked"
                            className="mb-0"
                        >
                            <Switch />
                        </Form.Item>

                        <Form.Item
                            name="isAvailable"
                            label="Disponível para Venda"
                            valuePropName="checked"
                            className="mb-0"
                        >
                            <Switch />
                        </Form.Item>
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default ProductModal;
