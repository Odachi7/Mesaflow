'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,      // 5 minutos - dados ficam "frescos" por mais tempo
                gcTime: 10 * 60 * 1000,        // 10 minutos - tempo em cache antes de garbage collection
                refetchOnWindowFocus: false,    // não refetch ao focar janela
                refetchOnMount: false,          // não refetch ao montar componente
                retry: 1,                       // apenas 1 retry em caso de erro
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
