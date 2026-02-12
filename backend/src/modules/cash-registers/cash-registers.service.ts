
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OpenSessionDto, CloseSessionDto } from './dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CashRegistersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(tenantId: string) {
        return this.prisma.cashRegister.findMany({
            where: { tenantId, isActive: true },
        });
    }

    async getActiveSession(tenantId: string, userId: string) {
        return this.prisma.cashSession.findFirst({
            where: {
                tenantId,
                cashierId: userId,
                status: 'open',
            },
            include: {
                cashRegister: true,
                cashier: { select: { fullName: true } },
            },
        });
    }

    async openSession(tenantId: string, userId: string, dto: OpenSessionDto) {
        // Verificar se usuário já tem sessão aberta
        const existingSession = await this.getActiveSession(tenantId, userId);
        if (existingSession) {
            throw new BadRequestException('Usuário já possui uma sessão de caixa aberta');
        }

        // Verificar se caixa existe
        const register = await this.prisma.cashRegister.findFirst({
            where: { id: dto.cashRegisterId, tenantId },
        });

        if (!register) {
            throw new NotFoundException('Caixa não encontrado');
        }

        // Verificar se caixa já está em uso por outro usuário
        const registerInUse = await this.prisma.cashSession.findFirst({
            where: {
                tenantId,
                cashRegisterId: dto.cashRegisterId,
                status: 'open',
            },
        });

        if (registerInUse) {
            throw new BadRequestException('Este caixa já está aberto por outro usuário');
        }

        return this.prisma.cashSession.create({
            data: {
                tenantId,
                cashRegisterId: dto.cashRegisterId,
                cashierId: userId,
                openingBalance: dto.openingBalance,
                status: 'open',
            },
            include: {
                cashRegister: true,
            },
        });
    }

    async getSessionSummary(tenantId: string, userId: string) {
        const session = await this.getActiveSession(tenantId, userId);
        if (!session) {
            throw new NotFoundException('Nenhuma sessão ativa encontrada');
        }

        // Buscar pagamentos realizados pelo usuário desde a abertura da sessão
        const payments = await this.prisma.payment.findMany({
            where: {
                tenantId,
                cashierId: userId,
                createdAt: {
                    gte: session.openedAt,
                },
            },
        });

        // Agrupar por método de pagamento
        const summary = payments.reduce((acc, payment) => {
            const method = payment.paymentMethod;
            const amount = Number(payment.amount);

            if (!acc[method]) acc[method] = 0;
            acc[method] += amount;
            acc.total += amount;

            return acc;
        }, { total: 0 } as Record<string, number>);

        return {
            sessionId: session.id,
            openedAt: session.openedAt,
            openingBalance: Number(session.openingBalance),
            sales: summary,
            expectedBalance: Number(session.openingBalance) + (summary['cash'] || 0),
        };
    }

    async closeSession(tenantId: string, userId: string, sessionId: string, dto: CloseSessionDto) {
        const session = await this.prisma.cashSession.findFirst({
            where: { id: sessionId, tenantId, cashierId: userId },
        });

        if (!session) {
            throw new NotFoundException('Sessão não encontrada');
        }

        if (session.status === 'closed') {
            throw new BadRequestException('Sessão já está fechada');
        }

        // Calcular esperado com base nos pagamentos reais
        const sessionSummary = await this.getSessionSummary(tenantId, userId);
        const expectedBalance = sessionSummary.expectedBalance;
        const difference = dto.closingBalance - expectedBalance;

        return this.prisma.cashSession.update({
            where: { id: sessionId },
            data: {
                status: 'closed',
                closedAt: new Date(),
                closingBalance: dto.closingBalance,
                expectedBalance: expectedBalance,
                difference: difference,
            },
        });
    }
}
