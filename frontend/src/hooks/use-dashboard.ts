
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface DashboardOverview {
    salesToday: number;
    ordersCount: number;
    activeOrders: number;
    occupiedTables: number;
}

export interface TopProduct {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

export interface RecentActivity {
    id: string;
    orderNumber: number;
    status: string;
    total: number;
    openedAt: string;
    table?: {
        tableNumber: string;
    };
    customerName?: string;
}

export const useDashboard = () => {
    // Overview
    const { data: overview, isLoading: isLoadingOverview } = useQuery<DashboardOverview>({
        queryKey: ['dashboard-overview'],
        queryFn: async () => {
            const response = await api.get('/dashboard/overview');
            return response.data;
        },
        refetchInterval: 30000, // Refresh every 30s
    });

    // Top Products
    const { data: topProducts, isLoading: isLoadingTopProducts } = useQuery<TopProduct[]>({
        queryKey: ['dashboard-top-products'],
        queryFn: async () => {
            const response = await api.get('/dashboard/top-products');
            return response.data;
        },
        refetchOnWindowFocus: false,
    });

    // Recent Activity
    const { data: recentActivity, isLoading: isLoadingRecent } = useQuery<RecentActivity[]>({
        queryKey: ['dashboard-recent'],
        queryFn: async () => {
            const response = await api.get('/dashboard/recent');
            return response.data;
        },
        refetchInterval: 15000,
    });

    return {
        overview,
        topProducts,
        recentActivity,
        isLoading: isLoadingOverview || isLoadingTopProducts || isLoadingRecent,
    };
};
