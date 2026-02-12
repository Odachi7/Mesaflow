import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Button, Select } from 'antd';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/catalog';

interface CategoryModalProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: CreateCategoryDto | UpdateCategoryDto) => void;
    initialValues?: Category | null;
    loading?: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
    open,
    onCancel,
    onSubmit,
    initialValues,
    loading
}) => {
    const [form] = Form.useForm();
    const isEditing = !!initialValues;

    useEffect(() => {
        if (open) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
                form.setFieldsValue({
                    isActive: true,
                    displayOrder: 0
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
            title={isEditing ? "Editar Categoria" : "Nova Categoria"}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Salvar"
            cancelText="Cancelar"
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ isActive: true, displayOrder: 0 }}
            >
                <Form.Item
                    name="name"
                    label="Nome"
                    rules={[{ required: true, message: 'Por favor, insira o nome da categoria' }]}
                >
                    <Input placeholder="Ex: Bebidas, Lanches..." />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Descrição"
                >
                    <Input.TextArea rows={3} placeholder="Descrição opcional..." />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="displayOrder"
                        label="Ordem de Exibição"
                        rules={[{ required: true, message: 'Insira a ordem' }]}
                    >
                        <InputNumber min={0} className="w-full" />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Ativo"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default CategoryModal;
