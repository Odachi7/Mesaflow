
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }

    async getOverview(tenantId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Total Sales Today
        const salesToday = await this.prisma.order.aggregate({
            _sum: {
                total: true,
            },
            where: {
                tenantId,
                status: 'closed',
                closedAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        // Total Orders Today
        const ordersCount = await this.prisma.order.count({
            where: {
                tenantId,
                openedAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        // Active Orders
        const activeOrders = await this.prisma.order.count({
            where: {
                tenantId,
                status: {
                    in: ['open', 'preparing', 'ready'],
                },
            },
        });

        // Occupied Tables
        const occupiedTables = await this.prisma.table.count({
            where: {
                tenantId,
                status: 'occupied',
            },
        });

        return {
            salesToday: Number(salesToday._sum.total || 0),
            ordersCount,
            activeOrders,
            occupiedTables,
        };
    }

    async getTopProducts(tenantId: string) {
        // Top 5 selling products (quantity based) - simplified logic
        // Ideally this would be grouped by productId on OrderItems
        const topItems = await this.prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
            },
            where: {
                tenantId,
                status: { not: 'cancelled' },
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: 5,
        });

        // Fetch product details for these IDs
        const productDetails = await Promise.all(
            topItems.map(async (item) => {
                const product = await this.prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { name: true, price: true },
                });
                return {
                    productId: item.productId,
                    name: product?.name || 'Produto Removido',
                    quantity: item._sum.quantity || 0,
                    price: Number(product?.price || 0),
                    total: (item._sum.quantity || 0) * Number(product?.price || 0),
                };
            })
        );

        return productDetails;
    }

    async getRecentActivity(tenantId: string) {
        return this.prisma.order.findMany({
            where: { tenantId },
            orderBy: { openedAt: 'desc' },
            take: 5,
            select: {
                id: true,
                orderNumber: true,
                status: true,
                total: true,
                openedAt: true,
                table: {
                    select: { tableNumber: true },
                },
                customerName: true,
            },
        });
    }
}
