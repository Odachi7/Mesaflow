
'use client';

import React, { useState } from 'react';
import { useCashier } from '@/hooks/use-cashier';
import { Button, Card, Spin, Statistic, Modal, Form, InputNumber, Select, Alert, Result, Descriptions, Divider } from 'antd';
import { DollarSign, Lock, Unlock, AlertTriangle, TrendingUp, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CashierPage() {
    const { session, summary, registers, isLoading, openSession, closeSession, isOpening, isClosing } = useCashier();
    const [isOpenModalVisible, setIsOpenModalVisible] = useState(false);
    const [isCloseModalVisible, setIsCloseModalVisible] = useState(false);
    const [closingDifference, setClosingDifference] = useState<number | null>(null);
    const [formOpen] = Form.useForm();
    const [formClose] = Form.useForm();

    const handleOpenSession = (values: any) => {
        openSession({
            cashRegisterId: values.cashRegisterId,
            openingBalance: values.openingBalance,
        }, {
            onSuccess: () => {
                setIsOpenModalVisible(false);
                formOpen.resetFields();
            }
        });
    };

    const handleCloseSession = (values: any) => {
        if (!session) return;
        closeSession({
            sessionId: session.id,
            closingBalance: values.closingBalance,
        }, {
            onSuccess: () => {
                setIsCloseModalVisible(false);
                formClose.resetFields();
            }
        });
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spin size="large" tip="Carregando informações do caixa..." />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="p-6 max-w-2xl mx-auto">
                <Result
                    icon={<Lock size={64} className="text-gray-400" />}
                    title="Nenhuma sessão ativa"
                    subTitle="Você precisa abrir um caixa para começar a registrar vendas."
                    extra={
                        <Button
                            type="primary"
                            size="large"
                            icon={<Unlock size={18} />}
                            onClick={() => setIsOpenModalVisible(true)}
                        >
                            Abrir Caixa
                        </Button>
                    }
                />

                <Modal
                    title="Abrir Sessão de Caixa"
                    open={isOpenModalVisible}
                    onCancel={() => setIsOpenModalVisible(false)}
                    onOk={() => formOpen.submit()}
                    confirmLoading={isOpening}
                >
                    <Form form={formOpen} layout="vertical" onFinish={handleOpenSession}>
                        <Form.Item
                            name="cashRegisterId"
                            label="Selecione o Caixa"
                            rules={[{ required: true, message: 'Selecione um caixa' }]}
                        >
                            <Select placeholder="Escolha um caixa disponível">
                                {registers.map(reg => (
                                    <Select.Option key={reg.id} value={reg.id}>
                                        {reg.name} {reg.location ? `(${reg.location})` : ''}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="openingBalance"
                            label="Fundo de Caixa (R$)"
                            rules={[{ required: true, message: 'Informe o valor inicial' }]}
                            initialValue={0}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                parser={value => value!.replace(/\$\s?|(.*)/g, '') as any}
                                min={0}
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <DollarSign /> Caixa: {session.cashRegister.name}
                    </h1>
                    <p className="text-gray-500">
                        Aberto em {new Date(session.openedAt).toLocaleString()}
                    </p>
                </div>
                <Button
                    danger
                    icon={<Lock size={18} />}
                    onClick={() => setIsCloseModalVisible(true)}
                >
                    Fechar Caixa
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <Statistic
                        title="Fundo de Abertura"
                        value={session.openingBalance}
                        precision={2}
                        prefix="R$"
                    />
                </Card>
                <Card>
                    <Statistic
                        title="Vendas Totais"
                        value={summary?.sales.total || 0}
                        precision={2}
                        prefix="R$"
                        valueStyle={{ color: '#3f8600' }}
                        suffix={<TrendingUp size={16} className="inline ml-1" />}
                    />
                </Card>
                <Card>
                    <Statistic
                        title="Saldo Esperado (Dinheiro)"
                        value={summary?.expectedBalance || 0}
                        precision={2}
                        prefix="R$"
                        suffix={<Wallet size={16} className="inline ml-1 text-gray-400" />}
                    />
                </Card>
            </div>

            {summary && (
                <Card title="Detalhamento de Vendas" size="small">
                    <Descriptions column={{ xs: 1, sm: 2, md: 4 }}>
                        <Descriptions.Item label="Dinheiro">R$ {Number(summary.sales['cash'] || 0).toFixed(2)}</Descriptions.Item>
                        <Descriptions.Item label="Crédito">R$ {Number(summary.sales['credit_card'] || 0).toFixed(2)}</Descriptions.Item>
                        <Descriptions.Item label="Débito">R$ {Number(summary.sales['debit_card'] || 0).toFixed(2)}</Descriptions.Item>
                        <Descriptions.Item label="PIX">R$ {Number(summary.sales['pix'] || 0).toFixed(2)}</Descriptions.Item>
                    </Descriptions>
                </Card>
            )}

            <Alert
                message="Sessão em Andamento"
                description="Todas as vendas realizadas por você serão registradas nesta sessão."
                type="info"
                showIcon
            />

            <Modal
                title="Fechar Sessão de Caixa"
                open={isCloseModalVisible}
                onCancel={() => {
                    setIsCloseModalVisible(false);
                    setClosingDifference(null);
                    formClose.resetFields();
                }}
                onOk={() => formClose.submit()}
                confirmLoading={isClosing}
                width={600}
            >
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Fundo de Abertura:</span>
                            <span className="font-medium">R$ {Number(session.openingBalance).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Vendas em Dinheiro:</span>
                            <span className="font-medium text-green-600">+ R$ {Number(summary?.sales['cash'] || 0).toFixed(2)}</span>
                        </div>
                        <Divider className="my-2" />
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Valor Esperado em Caixa:</span>
                            <span>R$ {Number(summary?.expectedBalance || 0).toFixed(2)}</span>
                        </div>
                    </div>

                    <Form
                        form={formClose}
                        layout="vertical"
                        onFinish={handleCloseSession}
                        onValuesChange={(changedValues) => {
                            if (changedValues.closingBalance !== undefined && summary) {
                                const diff = Number(changedValues.closingBalance) - summary.expectedBalance;
                                setClosingDifference(diff);
                            }
                        }}
                    >
                        <Form.Item
                            name="closingBalance"
                            label="Valor Contado em Gaveta (R$)"
                            rules={[{ required: true, message: 'Informe o valor final' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={value => `R$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                parser={value => value!.replace(/\$\s?|(.*)/g, '') as any}
                                min={0}
                                size="large"
                                autoFocus
                            />
                        </Form.Item>
                    </Form>

                    {closingDifference !== null && (
                        <Alert
                            message={closingDifference === 0 ? "Caixa Batendo!" : closingDifference > 0 ? "Sobra de Caixa" : "Quebra de Caixa"}
                            description={
                                <div className="text-lg font-bold">
                                    Diferença: R$ {Math.abs(closingDifference).toFixed(2)}
                                </div>
                            }
                            type={closingDifference === 0 ? "success" : closingDifference > 0 ? "info" : "error"}
                            showIcon
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
}
