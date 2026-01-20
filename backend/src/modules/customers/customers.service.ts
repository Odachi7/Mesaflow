import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerResponseDto } from './dto';

@Injectable()
export class CustomersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(tenantId: string, dto: CreateCustomerDto): Promise<CustomerResponseDto> {
        if (dto.email || dto.cpf) {
            const existing = await this.prisma.customer.findFirst({
                where: {
                    tenantId,
                    OR: [
                        dto.email ? { email: dto.email } : {},
                        dto.cpf ? { cpf: dto.cpf } : {},
                    ],
                },
            });

            if (existing) {
                throw new ConflictException('Cliente com mesmo email ou CPF já existe');
            }
        }

        const customer = await this.prisma.customer.create({
            data: {
                tenantId,
                name: dto.name,
                email: dto.email,
                phone: dto.phone,
                cpf: dto.cpf,
            },
            include: {
                _count: { select: { orders: true } },
            },
        });

        return CustomerResponseDto.fromEntity(customer);
    }

    async findAll(tenantId: string, search?: string): Promise<CustomerResponseDto[]> {
        const where: any = { tenantId };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        const customers = await this.prisma.customer.findMany({
            where,
            include: {
                _count: { select: { orders: true } },
            },
            orderBy: { name: 'asc' },
        });

        return CustomerResponseDto.fromEntities(customers);
    }

    async findOne(tenantId: string, id: string): Promise<CustomerResponseDto> {
        const customer = await this.prisma.customer.findFirst({
            where: { id, tenantId },
            include: {
                _count: { select: { orders: true } },
            },
        });

        if (!customer) {
            throw new NotFoundException('Cliente não encontrado');
        }

        return CustomerResponseDto.fromEntity(customer);
    }

    async update(
        tenantId: string,
        id: string,
        dto: UpdateCustomerDto,
    ): Promise<CustomerResponseDto> {
        await this.findOne(tenantId, id);

        if (dto.email || dto.cpf) {
            const existing = await this.prisma.customer.findFirst({
                where: {
                    tenantId,
                    NOT: { id },
                    OR: [
                        dto.email ? { email: dto.email } : {},
                        dto.cpf ? { cpf: dto.cpf } : {},
                    ],
                },
            });

            if (existing) {
                throw new ConflictException('Cliente com mesmo email ou CPF já existe');
            }
        }

        const customer = await this.prisma.customer.update({
            where: { id },
            data: dto,
            include: {
                _count: { select: { orders: true } },
            },
        });

        return CustomerResponseDto.fromEntity(customer);
    }

    async remove(tenantId: string, id: string): Promise<void> {
        await this.findOne(tenantId, id);
        await this.prisma.customer.delete({ where: { id } });
    }
}
