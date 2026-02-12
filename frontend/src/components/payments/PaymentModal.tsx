
import React, { useEffect, useState } from 'react';
import { Modal, Form, InputNumber, Button, Radio, Select } from 'antd';
import { DollarSign, CreditCard, Banknote } from 'lucide-react';
import { usePayments, CreatePaymentDto } from '@/hooks/use-payments';

interface PaymentModalProps {
    open: boolean;
    onClose: () => void;
    orderId: string;
    totalAmount: number;
    onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    open,
    onClose,
    orderId,
    totalAmount,
    onSuccess
}) => {
    const [form] = Form.useForm();
    const { createPayment, isPaying } = usePayments();

    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue({
                amount: totalAmount,
                paymentMethod: 'credit_card'
            });
        }
    }, [open, totalAmount, form]);

    const handleSubmit = (values: any) => {
        const paymentData: CreatePaymentDto = {
            orderId,
            paymentMethod: values.paymentMethod,
            amount: Number(values.amount),
        };

        createPayment(paymentData, {
            onSuccess: () => {
                onSuccess?.();
                onClose();
            }
        });
    };

    return (
        <Modal
            title="Registrar Pagamento"
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
        >
            <div className="mb-6 bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1 tracking-wider">Valor Total a Pagar</p>
                <p className="text-3xl font-extrabold text-blue-600">
                    R$ {Number(totalAmount).toFixed(2)}
                </p>
            </div>

            <Form layout="vertical" form={form} onFinish={handleSubmit}>
                <Form.Item
                    name="paymentMethod"
                    label="Forma de Pagamento"
                    rules={[{ required: true, message: 'Selecione um método' }]}
                >
                    <Select size="large">
                        <Select.Option value="credit_card">💳 Cartão de Crédito</Select.Option>
                        <Select.Option value="debit_card">💳 Cartão de Débito</Select.Option>
                        <Select.Option value="cash">💵 Dinheiro</Select.Option>
                        <Select.Option value="pix">💠 PIX</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="amount"
                    label="Valor Recebido (R$)"
                    rules={[{ required: true, message: 'Informe o valor' }]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                        parser={value => value!.replace(/R\$\s?|(.*)/g, '') as any}
                        min={0}
                        size="large"
                    />
                </Form.Item>

                <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={onClose} disabled={isPaying} size="large">
                        Cancelar
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isPaying}
                        size="large"
                        className="bg-green-600 hover:bg-green-700 w-full"
                    >
                        Confirmar e Fechar Conta
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};
