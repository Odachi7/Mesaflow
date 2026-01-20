import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from './dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(tenantId: string, dto: CreateCategoryDto): Promise<CategoryResponseDto> {
        // Verificar se já existe categoria com mesmo nome no tenant
        const existing = await this.prisma.category.findFirst({
            where: { tenantId, name: dto.name },
        });

        if (existing) {
            throw new ConflictException(`Categoria com nome '${dto.name}' já existe`);
        }

        const category = await this.prisma.category.create({
            data: {
                tenantId,
                name: dto.name,
                description: dto.description,
                displayOrder: dto.displayOrder ?? 0,
                isActive: dto.isActive ?? true,
            },
        });

        return CategoryResponseDto.fromEntity(category);
    }

    async findAll(tenantId: string, includeInactive = false): Promise<CategoryResponseDto[]> {
        const where: any = { tenantId };
        if (!includeInactive) {
            where.isActive = true;
        }

        const categories = await this.prisma.category.findMany({
            where,
            orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        return CategoryResponseDto.fromEntities(categories);
    }

    async findOne(tenantId: string, id: string): Promise<CategoryResponseDto> {
        const category = await this.prisma.category.findFirst({
            where: { id, tenantId },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            throw new NotFoundException(`Categoria com ID '${id}' não encontrada`);
        }

        return CategoryResponseDto.fromEntity(category);
    }

    async update(
        tenantId: string,
        id: string,
        dto: UpdateCategoryDto,
    ): Promise<CategoryResponseDto> {
        // Verificar se categoria existe
        await this.findOne(tenantId, id);

        // Se estiver atualizando o nome, verificar duplicidade
        if (dto.name) {
            const existing = await this.prisma.category.findFirst({
                where: {
                    tenantId,
                    name: dto.name,
                    NOT: { id },
                },
            });

            if (existing) {
                throw new ConflictException(`Categoria com nome '${dto.name}' já existe`);
            }
        }

        const category = await this.prisma.category.update({
            where: { id },
            data: dto,
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        return CategoryResponseDto.fromEntity(category);
    }

    async remove(tenantId: string, id: string): Promise<void> {
        const category = await this.prisma.category.findFirst({
            where: { id, tenantId },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        if (!category) {
            throw new NotFoundException(`Categoria com ID '${id}' não encontrada`);
        }

        // Verificar se tem produtos associados
        if (category._count.products > 0) {
            throw new ConflictException(
                `Não é possível excluir categoria com ${category._count.products} produto(s) associado(s). Desative a categoria ou mova os produtos primeiro.`,
            );
        }

        await this.prisma.category.delete({ where: { id } });
    }

    async reorder(
        tenantId: string,
        categoryIds: string[],
    ): Promise<CategoryResponseDto[]> {
        // Atualizar a ordem de exibição de cada categoria
        const updates = categoryIds.map((id, index) =>
            this.prisma.category.updateMany({
                where: { id, tenantId },
                data: { displayOrder: index },
            }),
        );

        await this.prisma.$transaction(updates);

        return this.findAll(tenantId, true);
    }

    async toggleActive(tenantId: string, id: string): Promise<CategoryResponseDto> {
        const category = await this.prisma.category.findFirst({
            where: { id, tenantId },
        });

        if (!category) {
            throw new NotFoundException(`Categoria com ID '${id}' não encontrada`);
        }

        const updated = await this.prisma.category.update({
            where: { id },
            data: { isActive: !category.isActive },
            include: {
                _count: {
                    select: { products: true },
                },
            },
        });

        return CategoryResponseDto.fromEntity(updated);
    }
}
