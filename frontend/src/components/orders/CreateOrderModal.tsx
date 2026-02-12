
import React, { useState } from 'react';
import { Modal, Form, Select, Input, Radio, Button } from 'antd';
import { useTables } from '@/hooks/use-tables';
import { useCustomers } from '@/hooks/use-customers';
import { UserOutlined } from '@ant-design/icons';

interface CreateOrderModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    isLoading: boolean;
}

const { Option } = Select;
const { TextArea } = Input;

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
    open,
    onClose,
    onSubmit,
    isLoading,
}) => {
    const [form] = Form.useForm();
    const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');

    const { tables, isLoading: isLoadingTables } = useTables({ status: 'available' });
    const { customers, isLoading: isLoadingCustomers } = useCustomers();

    const handleFinish = (values: any) => {
        onSubmit({
            ...values,
            orderType,
        });
        form.resetFields();
    };

    const handleTypeChange = (e: any) => {
        setOrderType(e.target.value);
    };

    return (
        <Modal
            title="Novo Pedido / Comanda"
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{ orderType: 'dine_in' }}
                preserve={false}
            >
                <Form.Item label="Tipo de Pedido" name="orderType" initialValue="dine_in">
                    <Radio.Group onChange={handleTypeChange} value={orderType} block buttonStyle="solid">
                        <Radio.Button value="dine_in">Mesa</Radio.Button>
                        <Radio.Button value="takeaway">Para Viagem</Radio.Button>
                        <Radio.Button value="delivery">Delivery</Radio.Button>
                    </Radio.Group>
                </Form.Item>

                {orderType === 'dine_in' && (
                    <Form.Item
                        name="tableId"
                        label="Selecionar Mesa"
                        rules={[{ required: true, message: 'Selecione uma mesa' }]}
                    >
                        <Select
                            placeholder="Escolha uma mesa disponível"
                            loading={isLoadingTables}
                            showSearch
                            optionFilterProp="children"
                        >
                            {tables.map(table => (
                                <Option key={table.id} value={table.id}>
                                    Mesa {table.tableNumber} ({table.capacity} lug.)
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Form.Item
                    name="customerId"
                    label="Cliente (Opcional)"
                >
                    <Select
                        placeholder="Buscar cliente..."
                        loading={isLoadingCustomers}
                        showSearch
                        allowClear
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {customers.map(customer => (
                            <Option key={customer.id} value={customer.id}>
                                <div className="flex items-center gap-2">
                                    <UserOutlined />
                                    {customer.name}
                                </div>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="customerName"
                    label="Nome do Cliente (Avulso)"
                    tooltip="Use este campo se o cliente não estiver cadastrado"
                >
                    <Input placeholder="Nome para identificação na comanda" />
                </Form.Item>

                <Form.Item
                    name="notes"
                    label="Observações"
                >
                    <TextArea rows={2} placeholder="Ex: Cliente aguardando no bar..." />
                </Form.Item>

                <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button type="primary" htmlType="submit" loading={isLoading}>
                        Abrir Pedido
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};
