import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    CreateOrderDto,
    AddOrderItemDto,
    UpdateOrderItemQuantityDto,
    ApplyDiscountDto,
    OrderResponseDto
} from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(tenantId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
        // Verificar se mesa existe e está disponível (se fornecida)
        if (dto.tableId) {
            const table = await this.prisma.table.findFirst({
                where: { id: dto.tableId, tenantId },
            });

            if (!table) {
                throw new BadRequestException('Mesa não encontrada');
            }

            if (table.status === 'occupied') {
                throw new BadRequestException('Mesa já está ocupada');
            }
        }

        // Verificar se número de comanda já existe
        const existing = await this.prisma.order.findFirst({
            where: { tenantId, orderNumber: dto.orderNumber },
        });

        if (existing) {
            throw new ConflictException(`Comanda '${dto.orderNumber}' já existe`);
        }

        // Criar pedido
        const order = await this.prisma.order.create({
            data: {
                tenantId,
                tableId: dto.tableId,
                orderNumber: dto.orderNumber,
                waiterId: dto.waiterId,
                customerId: dto.customerId,
                customerName: dto.customerName,
                status: 'open',
                orderType: dto.orderType,
                subtotal: 0,
                discount: 0,
                tax: 0,
                total: 0,
                notes: dto.notes,
            },
            include: {
                table: { select: { tableNumber: true } },
                waiter: { select: { fullName: true } },
                customer: { select: { name: true } },
            },
        });

        // Atualizar status da mesa se fornecida
        if (dto.tableId) {
            await this.prisma.table.update({
                where: { id: dto.tableId },
                data: { status: 'occupied' },
            });
        }

        return OrderResponseDto.fromEntity(order);
    }

    async findAll(
        tenantId: string,
        status?: string,
        tableId?: string,
    ): Promise<OrderResponseDto[]> {
        const where: any = { tenantId };

        if (status) {
            where.status = status;
        }

        if (tableId) {
            where.tableId = tableId;
        }

        const orders = await this.prisma.order.findMany({
            where,
            include: {
                table: { select: { tableNumber: true } },
                waiter: { select: { fullName: true } },
                customer: { select: { name: true } },
                items: {
                    include: {
                        product: { select: { name: true } },
                    },
                },
            },
            orderBy: { openedAt: 'desc' },
        });

        return OrderResponseDto.fromEntities(orders);
    }

    async findOne(tenantId: string, id: string): Promise<OrderResponseDto> {
        const order = await this.prisma.order.findFirst({
            where: { id, tenantId },
            include: {
                table: { select: { tableNumber: true } },
                waiter: { select: { fullName: true } },
                customer: { select: { name: true } },
                items: {
                    include: {
                        product: { select: { name: true } },
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundException('Pedido não encontrado');
        }

        return OrderResponseDto.fromEntity(order);
    }

    async addItem(
        tenantId: string,
        orderId: string,
        dto: AddOrderItemDto,
    ): Promise<OrderResponseDto> {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenantId },
        });

        if (!order) {
            throw new NotFoundException('Pedido não encontrado');
        }

        if (order.status === 'closed' || order.status === 'cancelled') {
            throw new BadRequestException('Não é possível adicionar itens a um pedido fechado ou cancelado');
        }

        // Buscar produto
        const product = await this.prisma.product.findFirst({
            where: { id: dto.productId, tenantId },
        });

        if (!product) {
            throw new BadRequestException('Produto não encontrado');
        }

        if (!product.isAvailable || !product.isActive) {
            throw new BadRequestException('Produto não disponível para venda');
        }

        // Calcular subtotal do item
        const unitPrice = product.price instanceof Decimal ? product.price.toNumber() : Number(product.price);
        const subtotal = unitPrice * dto.quantity;

        // Adicionar item
        await this.prisma.orderItem.create({
            data: {
                tenantId,
                orderId,
                productId: dto.productId,
                quantity: dto.quantity,
                unitPrice,
                subtotal,
                status: 'pending',
                notes: dto.notes,
            },
        });

        // Recalcular totais do pedido
        await this.recalculateOrderTotals(orderId);

        return this.findOne(tenantId, orderId);
    }

    async updateItemQuantity(
        tenantId: string,
        orderId: string,
        itemId: string,
        dto: UpdateOrderItemQuantityDto,
    ): Promise<OrderResponseDto> {
        const item = await this.prisma.orderItem.findFirst({
            where: { id: itemId, orderId, tenantId },
        });

        if (!item) {
            throw new NotFoundException('Item não encontrado');
        }

        // Recalcular subtotal
        const unitPrice = item.unitPrice instanceof Decimal ? item.unitPrice.toNumber() : Number(item.unitPrice);
        const subtotal = unitPrice * dto.quantity;

        await this.prisma.orderItem.update({
            where: { id: itemId },
            data: {
                quantity: dto.quantity,
                subtotal,
            },
        });

        await this.recalculateOrderTotals(orderId);

        return this.findOne(tenantId, orderId);
    }

    async removeItem(tenantId: string, orderId: string, itemId: string): Promise<OrderResponseDto> {
        const item = await this.prisma.orderItem.findFirst({
            where: { id: itemId, orderId, tenantId },
        });

        if (!item) {
            throw new NotFoundException('Item não encontrado');
        }

        await this.prisma.orderItem.delete({ where: { id: itemId } });
        await this.recalculateOrderTotals(orderId);

        return this.findOne(tenantId, orderId);
    }

    async applyDiscount(
        tenantId: string,
        orderId: string,
        dto: ApplyDiscountDto,
    ): Promise<OrderResponseDto> {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenantId },
        });

        if (!order) {
            throw new NotFoundException('Pedido não encontrado');
        }

        await this.prisma.order.update({
            where: { id: orderId },
            data: { discount: dto.discount || 0 },
        });

        await this.recalculateOrderTotals(orderId);

        return this.findOne(tenantId, orderId);
    }

    async closeOrder(tenantId: string, orderId: string): Promise<OrderResponseDto> {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenantId },
        });

        if (!order) {
            throw new NotFoundException('Pedido não encontrado');
        }

        if (order.status === 'closed') {
            throw new BadRequestException('Pedido já está fechado');
        }

        await this.prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'closed',
                closedAt: new Date(),
            },
        });

        // Liberar mesa se houver
        if (order.tableId) {
            await this.prisma.table.update({
                where: { id: order.tableId },
                data: { status: 'available' },
            });
        }

        return this.findOne(tenantId, orderId);
    }

    async cancelOrder(tenantId: string, orderId: string): Promise<OrderResponseDto> {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenantId },
        });

        if (!order) {
            throw new NotFoundException('Pedido não encontrado');
        }

        if (order.status === 'closed') {
            throw new BadRequestException('Não é possível cancelar pedido fechado');
        }

        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'cancelled', closedAt: new Date() },
        });

        // Liberar mesa se houver
        if (order.tableId) {
            await this.prisma.table.update({
                where: { id: order.tableId },
                data: { status: 'available' },
            });
        }

        return this.findOne(tenantId, orderId);
    }

    private async recalculateOrderTotals(orderId: string): Promise<void> {
        // Buscar todos os itens do pedido
        const items = await this.prisma.orderItem.findMany({
            where: { orderId },
        });

        // Calcular subtotal
        const subtotal = items.reduce((sum, item) => {
            const itemSubtotal = item.subtotal instanceof Decimal ? item.subtotal.toNumber() : Number(item.subtotal);
            return sum + itemSubtotal;
        }, 0);

        // Buscar pedido para pegar desconto
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        const discount = order?.discount instanceof Decimal ? order.discount.toNumber() : Number(order?.discount || 0);

        // Calcular taxa (10% - pode ser configurável)
        const taxRate = 0.10;
        const tax = (subtotal - discount) * taxRate;

        // Calcular total
        const total = subtotal - discount + tax;

        // Atualizar pedido
        await this.prisma.order.update({
            where: { id: orderId },
            data: {
                subtotal,
                tax,
                total,
            },
        });
    }
}
