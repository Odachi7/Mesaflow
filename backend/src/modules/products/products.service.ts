import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto, UpdateProductDto, FilterProductsDto, ProductResponseDto } from './dto';

@Injectable()
export class ProductsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(tenantId: string, dto: CreateProductDto): Promise<ProductResponseDto> {
        // Verificar se categoria existe (se fornecida)
        if (dto.categoryId) {
            const category = await this.prisma.category.findFirst({
                where: { id: dto.categoryId, tenantId },
            });

            if (!category) {
                throw new BadRequestException(`Categoria com ID '${dto.categoryId}' não encontrada`);
            }

            if (!category.isActive) {
                throw new BadRequestException('Não é possível adicionar produtos em categoria inativa');
            }
        }

        // Verificar se já existe produto com mesmo nome
        const existing = await this.prisma.product.findFirst({
            where: { tenantId, name: dto.name },
        });

        if (existing) {
            throw new ConflictException(`Produto com nome '${dto.name}' já existe`);
        }

        const product = await this.prisma.product.create({
            data: {
                tenantId,
                categoryId: dto.categoryId,
                name: dto.name,
                description: dto.description,
                price: dto.price,
                costPrice: dto.costPrice,
                imageUrl: dto.imageUrl,
                preparationTime: dto.preparationTime,
                isAvailable: dto.isAvailable ?? true,
                isActive: dto.isActive ?? true,
            },
            include: {
                category: {
                    select: { name: true },
                },
            },
        });

        return ProductResponseDto.fromEntity(product);
    }

    async findAll(tenantId: string, filters?: FilterProductsDto): Promise<ProductResponseDto[]> {
        const where: any = { tenantId };

        if (filters?.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters?.onlyAvailable) {
            where.isAvailable = true;
        }

        if (filters?.onlyActive !== undefined) {
            where.isActive = filters.onlyActive;
        } else {
            // Por padrão, mostrar apenas ativos
            where.isActive = true;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const products = await this.prisma.product.findMany({
            where,
            include: {
                category: {
                    select: { name: true },
                },
            },
            orderBy: [
                { category: { displayOrder: 'asc' } },
                { name: 'asc' },
            ],
        });

        return ProductResponseDto.fromEntities(products);
    }

    async findOne(tenantId: string, id: string): Promise<ProductResponseDto> {
        const product = await this.prisma.product.findFirst({
            where: { id, tenantId },
            include: {
                category: {
                    select: { name: true },
                },
            },
        });

        if (!product) {
            throw new NotFoundException(`Produto com ID '${id}' não encontrado`);
        }

        return ProductResponseDto.fromEntity(product);
    }

    async update(
        tenantId: string,
        id: string,
        dto: UpdateProductDto,
    ): Promise<ProductResponseDto> {
        // Verificar se produto existe
        await this.findOne(tenantId, id);

        // Verificar categoria se fornecida
        if (dto.categoryId) {
            const category = await this.prisma.category.findFirst({
                where: { id: dto.categoryId, tenantId },
            });

            if (!category) {
                throw new BadRequestException(`Categoria com ID '${dto.categoryId}' não encontrada`);
            }
        }

        // Se estiver atualizando o nome, verificar duplicidade
        if (dto.name) {
            const existing = await this.prisma.product.findFirst({
                where: {
                    tenantId,
                    name: dto.name,
                    NOT: { id },
                },
            });

            if (existing) {
                throw new ConflictException(`Produto com nome '${dto.name}' já existe`);
            }
        }

        const product = await this.prisma.product.update({
            where: { id },
            data: dto,
            include: {
                category: {
                    select: { name: true },
                },
            },
        });

        return ProductResponseDto.fromEntity(product);
    }

    async remove(tenantId: string, id: string): Promise<void> {
        const product = await this.prisma.product.findFirst({
            where: { id, tenantId },
            include: {
                _count: {
                    select: { orderItems: true },
                },
            },
        });

        if (!product) {
            throw new NotFoundException(`Produto com ID '${id}' não encontrado`);
        }

        // Verificar se tem pedidos associados
        if (product._count.orderItems > 0) {
            throw new ConflictException(
                `Não é possível excluir produto com ${product._count.orderItems} item(ns) de pedido associado(s). Desative o produto em vez de excluí-lo.`,
            );
        }

        await this.prisma.product.delete({ where: { id } });
    }

    async toggleAvailability(tenantId: string, id: string): Promise<ProductResponseDto> {
        const product = await this.prisma.product.findFirst({
            where: { id, tenantId },
        });

        if (!product) {
            throw new NotFoundException(`Produto com ID '${id}' não encontrado`);
        }

        const updated = await this.prisma.product.update({
            where: { id },
            data: { isAvailable: !product.isAvailable },
            include: {
                category: {
                    select: { name: true },
                },
            },
        });

        return ProductResponseDto.fromEntity(updated);
    }

    async toggleActive(tenantId: string, id: string): Promise<ProductResponseDto> {
        const product = await this.prisma.product.findFirst({
            where: { id, tenantId },
        });

        if (!product) {
            throw new NotFoundException(`Produto com ID '${id}' não encontrado`);
        }

        const updated = await this.prisma.product.update({
            where: { id },
            data: { isActive: !product.isActive },
            include: {
                category: {
                    select: { name: true },
                },
            },
        });

        return ProductResponseDto.fromEntity(updated);
    }
}
