import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTableDto, UpdateTableDto, UpdateTableStatusDto, TableResponseDto } from './dto';
import { QRCodeService } from './qrcode.service';

@Injectable()
export class TablesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly qrcodeService: QRCodeService,
    ) { }

    async create(tenantId: string, dto: CreateTableDto): Promise<TableResponseDto> {
        // Verificar se já existe mesa com mesmo número
        const existing = await this.prisma.table.findFirst({
            where: { tenantId, tableNumber: dto.tableNumber },
        });

        if (existing) {
            throw new ConflictException(`Mesa número '${dto.tableNumber}' já existe`);
        }

        // Gerar QR Code para a mesa
        const qrCode = await this.qrcodeService.generateTableQRCode(tenantId, dto.tableNumber);

        const table = await this.prisma.table.create({
            data: {
                tenantId,
                tableNumber: dto.tableNumber,
                capacity: dto.capacity,
                status: dto.status ?? 'available',
                qrCode,
            },
        });

        return TableResponseDto.fromEntity(table);
    }

    async findAll(tenantId: string, status?: string): Promise<TableResponseDto[]> {
        const where: any = { tenantId };

        if (status) {
            where.status = status;
        }

        const tables = await this.prisma.table.findMany({
            where,
            orderBy: { tableNumber: 'asc' },
        });

        return TableResponseDto.fromEntities(tables);
    }

    async findOne(tenantId: string, id: string): Promise<TableResponseDto> {
        const table = await this.prisma.table.findFirst({
            where: { id, tenantId },
        });

        if (!table) {
            throw new NotFoundException(`Mesa com ID '${id}' não encontrada`);
        }

        return TableResponseDto.fromEntity(table);
    }

    async update(
        tenantId: string,
        id: string,
        dto: UpdateTableDto,
    ): Promise<TableResponseDto> {
        // Verificar se mesa existe
        await this.findOne(tenantId, id);

        // Se estiver atualizando o número, verificar duplicidade
        if (dto.tableNumber) {
            const existing = await this.prisma.table.findFirst({
                where: {
                    tenantId,
                    tableNumber: dto.tableNumber,
                    NOT: { id },
                },
            });

            if (existing) {
                throw new ConflictException(`Mesa número '${dto.tableNumber}' já existe`);
            }
        }

        const table = await this.prisma.table.update({
            where: { id },
            data: dto,
        });

        return TableResponseDto.fromEntity(table);
    }

    async updateStatus(
        tenantId: string,
        id: string,
        dto: UpdateTableStatusDto,
    ): Promise<TableResponseDto> {
        await this.findOne(tenantId, id);

        const table = await this.prisma.table.update({
            where: { id },
            data: { status: dto.status },
        });

        return TableResponseDto.fromEntity(table);
    }

    async remove(tenantId: string, id: string): Promise<void> {
        const table = await this.prisma.table.findFirst({
            where: { id, tenantId },
            include: {
                _count: {
                    select: { orders: true },
                },
            },
        });

        if (!table) {
            throw new NotFoundException(`Mesa com ID '${id}' não encontrada`);
        }

        // Verificar se tem pedidos associados
        if (table._count.orders > 0) {
            throw new ConflictException(
                `Não é possível excluir mesa com ${table._count.orders} pedido(s) associado(s).`,
            );
        }

        await this.prisma.table.delete({ where: { id } });
    }

    async regenerateQRCode(tenantId: string, id: string): Promise<TableResponseDto> {
        const table = await this.findOne(tenantId, id);

        // Regenerar QR Code
        const qrCode = await this.qrcodeService.generateTableQRCode(tenantId, table.tableNumber);

        const updated = await this.prisma.table.update({
            where: { id },
            data: { qrCode },
        });

        return TableResponseDto.fromEntity(updated);
    }
}
