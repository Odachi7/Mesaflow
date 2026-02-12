import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Button } from 'antd';
import { Category } from '@/hooks/use-categories';

interface CategoryFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    isLoading: boolean;
    category?: Category | null;
}

const { TextArea } = Input;

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
    open,
    onClose,
    onSubmit,
    isLoading,
    category,
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (category) {
                form.setFieldsValue(category);
            } else {
                form.resetFields();
            }
        }
    }, [open, category, form]);

    const handleFinish = (values: any) => {
        onSubmit(values);
        form.resetFields();
    };

    return (
        <Modal
            title={category ? `Editar Categoria: ${category.name}` : 'Nova Categoria'}
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            width={500}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                preserve={false}
                initialValues={{
                    isActive: true,
                    displayOrder: 1
                }}
            >
                <Form.Item
                    name="name"
                    label="Nome da Categoria"
                    rules={[{ required: true, message: 'Por favor insira o nome' }]}
                >
                    <Input placeholder="Ex: Lanches, Bebidas" size="large" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Descrição"
                >
                    <TextArea rows={3} placeholder="Descrição breve da categoria..." />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="displayOrder"
                        label="Ordem de Exibição"
                        rules={[{ required: true, message: 'Insira a ordem' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <div className="flex items-center mt-2">
                        <Form.Item
                            name="isActive"
                            valuePropName="checked"
                            label="Ativa?"
                            className="mb-0"
                        >
                            <Switch checkedChildren="Sim" unCheckedChildren="Não" />
                        </Form.Item>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button type="primary" htmlType="submit" loading={isLoading}>
                        {category ? 'Salvar Alterações' : 'Criar Categoria'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};
