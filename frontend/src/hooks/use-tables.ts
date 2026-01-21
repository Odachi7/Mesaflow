import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { App } from 'antd';
import { Table } from '@/components/tables/TableCard';

interface CreateTableDto {
    tableNumber: string;
    capacity: number;
    status: string;
}

interface UpdateTableDto extends CreateTableDto {
    id: string;
}

export const useTables = () => {
    const { message } = App.useApp();
    const queryClient = useQueryClient();

    // Fetch all tables
    const {
        data: tables,
        isLoading,
        error,
    } = useQuery<Table[]>({
        queryKey: ['tables'],
        queryFn: async () => {
            console.log('[useTables] Fetching tables from API...');
            try {
                const response = await api.get('/tables');
                console.log('[useTables] Success:', response.data);
                return response.data;
            } catch (err: any) {
                console.error('[useTables] Error fetching tables:', err);
                console.error('[useTables] Error response:', err.response?.data);
                throw err;
            }
        },
    });

    // Create table mutation
    const createTableMutation = useMutation({
        mutationFn: async (data: CreateTableDto) => {
            console.log('[useTables] Creating table:', data);
            const response = await api.post('/tables', data);
            console.log('[useTables] Table created:', response.data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            message.success('Mesa criada com sucesso!');
        },
        onError: (error: any) => {
            console.error('[useTables] Create error:', error);
            const msg = error.response?.data?.message || 'Erro ao criar mesa';
            message.error(Array.isArray(msg) ? msg[0] : msg);
        },
    });

    // Update table mutation
    const updateTableMutation = useMutation({
        mutationFn: async ({ id, ...data }: UpdateTableDto) => {
            const response = await api.patch(`/tables/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            message.success('Mesa atualizada com sucesso!');
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Erro ao atualizar mesa';
            message.error(Array.isArray(msg) ? msg[0] : msg);
        },
    });

    // Delete table mutation
    const deleteTableMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/tables/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            message.success('Mesa excluída com sucesso!');
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || 'Erro ao excluir mesa';
            message.error(Array.isArray(msg) ? msg[0] : msg);
        },
    });

    console.log('[useTables] Current state:', {
        tablesCount: tables?.length || 0,
        isLoading,
        hasError: !!error
    });

    return {
        tables: tables || [],
        isLoading,
        error,
        createTable: createTableMutation.mutate,
        updateTable: updateTableMutation.mutate,
        deleteTable: deleteTableMutation.mutate,
        isCreating: createTableMutation.isPending,
        isUpdating: updateTableMutation.isPending,
        isDeleting: deleteTableMutation.isPending,
    };
};
