import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentDto, PaymentResponseDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PaymentsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(
        tenantId: string,
        dto: CreatePaymentDto,
        cashierId?: string,
    ): Promise<PaymentResponseDto> {
        // Verificar se pedido existe
        const order = await this.prisma.order.findFirst({
            where: { id: dto.orderId, tenantId },
        });

        if (!order) {
            throw new NotFoundException('Pedido não encontrado');
        }

        if (order.status !== 'closed') {
            throw new BadRequestException('Apenas pedidos fechados podem receber pagamento');
        }

        // Calcular total já pago
        const existingPayments = await this.prisma.payment.findMany({
            where: { orderId: dto.orderId, status: 'completed' },
        });

        const totalPaid = existingPayments.reduce((sum, p) => {
            const amount = p.amount instanceof Decimal ? p.amount.toNumber() : Number(p.amount);
            return sum + amount;
        }, 0);

        const orderTotal = order.total instanceof Decimal ? order.total.toNumber() : Number(order.total);
        const remaining = orderTotal - totalPaid;

        if (dto.amount > remaining) {
            throw new BadRequestException(
                `Valor excede o restante a pagar. Restante: R$ ${remaining.toFixed(2)}`,
            );
        }

        // Criar pagamento
        const payment = await this.prisma.payment.create({
            data: {
                tenantId,
                orderId: dto.orderId,
                paymentMethod: dto.paymentMethod,
                amount: dto.amount,
                status: 'completed',
                cashierId,
                transactionId: this.generateTransactionId(dto.paymentMethod),
            },
            include: {
                order: { select: { orderNumber: true } },
                cashier: { select: { fullName: true } },
            },
        });

        return PaymentResponseDto.fromEntity(payment);
    }

    async findAll(tenantId: string, orderId?: string): Promise<PaymentResponseDto[]> {
        const where: any = { tenantId };

        if (orderId) {
            where.orderId = orderId;
        }

        const payments = await this.prisma.payment.findMany({
            where,
            include: {
                order: { select: { orderNumber: true } },
                cashier: { select: { fullName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return PaymentResponseDto.fromEntities(payments);
    }

    async findOne(tenantId: string, id: string): Promise<PaymentResponseDto> {
        const payment = await this.prisma.payment.findFirst({
            where: { id, tenantId },
            include: {
                order: { select: { orderNumber: true } },
                cashier: { select: { fullName: true } },
            },
        });

        if (!payment) {
            throw new NotFoundException('Pagamento não encontrado');
        }

        return PaymentResponseDto.fromEntity(payment);
    }

    async getOrderPaymentSummary(tenantId: string, orderId: string) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, tenantId },
        });

        if (!order) {
            throw new NotFoundException('Pedido não encontrado');
        }

        const payments = await this.prisma.payment.findMany({
            where: { orderId, status: 'completed' },
        });

        const totalPaid = payments.reduce((sum, p) => {
            const amount = p.amount instanceof Decimal ? p.amount.toNumber() : Number(p.amount);
            return sum + amount;
        }, 0);

        const orderTotal = order.total instanceof Decimal ? order.total.toNumber() : Number(order.total);
        const remaining = orderTotal - totalPaid;

        return {
            orderId,
            orderNumber: order.orderNumber,
            total: orderTotal,
            totalPaid,
            remaining,
            isPaidInFull: remaining <= 0,
            payments: payments.length,
        };
    }

    private generateTransactionId(method: string): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${method.toUpperCase()}-${timestamp}-${random}`;
    }
}
