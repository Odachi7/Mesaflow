import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Order, OrderItem } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class OrderItemResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    productId: string;

    @ApiProperty()
    productName: string;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    unitPrice: number;

    @ApiProperty()
    subtotal: number;

    @ApiProperty()
    status: string;

    @ApiPropertyOptional()
    notes: string | null;

    @ApiProperty()
    createdAt: Date;

    static fromEntity(item: OrderItem & { product: { name: string } }): OrderItemResponseDto {
        const dto = new OrderItemResponseDto();
        dto.id = item.id;
        dto.productId = item.productId;
        dto.productName = item.product.name;
        dto.quantity = item.quantity;
        dto.unitPrice = item.unitPrice instanceof Decimal ? item.unitPrice.toNumber() : Number(item.unitPrice);
        dto.subtotal = item.subtotal instanceof Decimal ? item.subtotal.toNumber() : Number(item.subtotal);
        dto.status = item.status;
        dto.notes = item.notes;
        dto.createdAt = item.createdAt;
        return dto;
    }
}

export class OrderResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    tenantId: string;

    @ApiPropertyOptional()
    tableId: string | null;

    @ApiPropertyOptional()
    tableNumber: string | null;

    @ApiProperty()
    orderNumber: string;

    @ApiPropertyOptional()
    waiterId: string | null;

    @ApiPropertyOptional()
    waiterName: string | null;

    @ApiPropertyOptional()
    customerId: string | null;

    @ApiPropertyOptional()
    customerName: string | null;

    @ApiProperty()
    status: string;

    @ApiPropertyOptional()
    orderType: string | null;

    @ApiProperty()
    subtotal: number;

    @ApiProperty()
    discount: number;

    @ApiProperty()
    tax: number;

    @ApiProperty()
    total: number;

    @ApiPropertyOptional()
    notes: string | null;

    @ApiProperty()
    openedAt: Date;

    @ApiPropertyOptional()
    closedAt: Date | null;

    @ApiPropertyOptional({ type: [OrderItemResponseDto] })
    items?: OrderItemResponseDto[];

    static fromEntity(
        order: Order & {
            table?: { tableNumber: string } | null;
            waiter?: { fullName: string } | null;
            customer?: { name: string } | null;
            items?: (OrderItem & { product: { name: string } })[];
        },
    ): OrderResponseDto {
        const dto = new OrderResponseDto();
        dto.id = order.id;
        dto.tenantId = order.tenantId;
        dto.tableId = order.tableId;
        dto.tableNumber = order.table?.tableNumber || null;
        dto.orderNumber = order.orderNumber;
        dto.waiterId = order.waiterId;
        dto.waiterName = order.waiter?.fullName || null;
        dto.customerId = order.customerId;
        dto.customerName = order.customer?.name || order.customerName;
        dto.status = order.status;
        dto.orderType = order.orderType;
        dto.subtotal = order.subtotal instanceof Decimal ? order.subtotal.toNumber() : Number(order.subtotal);
        dto.discount = order.discount instanceof Decimal ? order.discount.toNumber() : Number(order.discount);
        dto.tax = order.tax instanceof Decimal ? order.tax.toNumber() : Number(order.tax);
        dto.total = order.total instanceof Decimal ? order.total.toNumber() : Number(order.total);
        dto.notes = order.notes;
        dto.openedAt = order.openedAt;
        dto.closedAt = order.closedAt;

        if (order.items) {
            dto.items = order.items.map(item => OrderItemResponseDto.fromEntity(item));
        }

        return dto;
    }

    static fromEntities(
        orders: (Order & {
            table?: { tableNumber: string } | null;
            waiter?: { fullName: string } | null;
            customer?: { name: string } | null;
            items?: (OrderItem & { product: { name: string } })[];
        })[],
    ): OrderResponseDto[] {
        return orders.map(o => OrderResponseDto.fromEntity(o));
    }
}
