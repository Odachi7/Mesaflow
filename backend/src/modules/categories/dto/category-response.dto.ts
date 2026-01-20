import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '@prisma/client';

export class CategoryResponseDto {
    @ApiProperty({ description: 'ID único da categoria' })
    id: string;

    @ApiProperty({ description: 'ID do tenant' })
    tenantId: string;

    @ApiProperty({ description: 'Nome da categoria' })
    name: string;

    @ApiPropertyOptional({ description: 'Descrição da categoria' })
    description: string | null;

    @ApiProperty({ description: 'Ordem de exibição' })
    displayOrder: number;

    @ApiProperty({ description: 'Se a categoria está ativa' })
    isActive: boolean;

    @ApiProperty({ description: 'Data de criação' })
    createdAt: Date;

    @ApiPropertyOptional({ description: 'Quantidade de produtos na categoria' })
    productCount?: number;

    static fromEntity(category: Category & { _count?: { products: number } }): CategoryResponseDto {
        const dto = new CategoryResponseDto();
        dto.id = category.id;
        dto.tenantId = category.tenantId;
        dto.name = category.name;
        dto.description = category.description;
        dto.displayOrder = category.displayOrder;
        dto.isActive = category.isActive;
        dto.createdAt = category.createdAt;
        if (category._count) {
            dto.productCount = category._count.products;
        }
        return dto;
    }

    static fromEntities(categories: (Category & { _count?: { products: number } })[]): CategoryResponseDto[] {
        return categories.map(c => CategoryResponseDto.fromEntity(c));
    }
}
