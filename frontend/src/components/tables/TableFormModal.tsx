import React from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';
import { Table } from '@/components/tables/TableCard';

interface TableFormModalProps {
    open: boolean;
    table?: Table | null;
    onClose: () => void;
    onSubmit: (values: any) => void;
    isLoading?: boolean;
}

export default function TableFormModal({
    open,
    table,
    onClose,
    onSubmit,
    isLoading = false,
}: TableFormModalProps) {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (open) {
            if (table) {
                form.setFieldsValue(table);
            } else {
                form.resetFields();
            }
        }
    }, [open, table, form]);

    const handleFinish = (values: any) => {
        onSubmit(values);
        form.resetFields();
    };

    return (
        <Modal
            title={table ? `Editar Mesa ${table.tableNumber}` : 'Nova Mesa'}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            okText={table ? 'Salvar' : 'Criar'}
            cancelText="Cancelar"
            confirmLoading={isLoading}
            width={500}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{
                    status: 'available',
                    capacity: 4,
                }}
                preserve={false}
            >
                <Form.Item
                    label="Número da Mesa"
                    name="tableNumber"
                    rules={[
                        { required: true, message: 'Por favor, informe o número da mesa' },
                    ]}
                >
                    <Input placeholder="Ex: 1, 2A, VIP-1" size="large" />
                </Form.Item>

                <Form.Item
                    label="Capacidade"
                    name="capacity"
                    rules={[
                        { required: true, message: 'Por favor, informe a capacidade' },
                        { type: 'number', min: 1, max: 20, message: 'Capacidade deve ser entre 1 e 20' },
                    ]}
                >
                    <InputNumber
                        placeholder="Número de pessoas"
                        size="large"
                        className="w-full"
                        min={1}
                        max={20}
                    />
                </Form.Item>

                <Form.Item
                    label="Status"
                    name="status"
                    rules={[{ required: true, message: 'Por favor, selecione um status' }]}
                >
                    <Select
                        size="large"
                        placeholder="Selecione o status"
                        options={[
                            { label: 'Disponível', value: 'available' },
                            { label: 'Ocupada', value: 'occupied' },
                            { label: 'Reservada', value: 'reserved' },
                            { label: 'Manutenção', value: 'maintenance' },
                        ]}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
