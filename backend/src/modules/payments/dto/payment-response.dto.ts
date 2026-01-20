import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Payment } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class PaymentResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    tenantId: string;

    @ApiProperty()
    orderId: string;

    @ApiProperty()
    orderNumber: string;

    @ApiProperty()
    paymentMethod: string;

    @ApiProperty()
    amount: number;

    @ApiProperty()
    status: string;

    @ApiPropertyOptional()
    transactionId: string | null;

    @ApiPropertyOptional()
    cashierId: string | null;

    @ApiPropertyOptional()
    cashierName: string | null;

    @ApiProperty()
    createdAt: Date;

    static fromEntity(
        payment: Payment & {
            order: { orderNumber: string };
            cashier?: { fullName: string } | null;
        },
    ): PaymentResponseDto {
        const dto = new PaymentResponseDto();
        dto.id = payment.id;
        dto.tenantId = payment.tenantId;
        dto.orderId = payment.orderId;
        dto.orderNumber = payment.order.orderNumber;
        dto.paymentMethod = payment.paymentMethod;
        dto.amount = payment.amount instanceof Decimal ? payment.amount.toNumber() : Number(payment.amount);
        dto.status = payment.status;
        dto.transactionId = payment.transactionId;
        dto.cashierId = payment.cashierId;
        dto.cashierName = payment.cashier?.fullName || null;
        dto.createdAt = payment.createdAt;
        return dto;
    }

    static fromEntities(
        payments: (Payment & {
            order: { orderNumber: string };
            cashier?: { fullName: string } | null;
        })[],
    ): PaymentResponseDto[] {
        return payments.map(p => PaymentResponseDto.fromEntity(p));
    }
}
