'use client';

import React from 'react';
import { Result, Button } from 'antd';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function CategoriesPage() {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center h-full min-h-[500px]">
            <Result
                status="403"
                title="Módulo em Desenvolvimento"
                subTitle="A gestão de categorias estará disponível na próxima etapa."
                extra={
                    <Button
                        type="primary"
                        icon={<ArrowLeft size={16} />}
                        onClick={() => router.back()}
                    >
                        Voltar
                    </Button>
                }
            />
        </div>
    );
}
