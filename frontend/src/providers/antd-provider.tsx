'use client';

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App } from 'antd';
import ptBR from 'antd/locale/pt_BR';

const theme = {
    token: {
        colorPrimary: '#2563eb', // Blue-600
        borderRadius: 6,
    },
};

const AntdConfigProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <AntdRegistry>
            <ConfigProvider locale={ptBR} theme={theme}>
                <App>
                    {children}
                </App>
            </ConfigProvider>
        </AntdRegistry>
    );
};

export default AntdConfigProvider;
