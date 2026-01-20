import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductResponseDto {
    @ApiProperty({ description: 'ID único do produto' })
    id: string;

    @ApiProperty({ description: 'ID do tenant' })
    tenantId: string;

    @ApiPropertyOptional({ description: 'ID da categoria' })
    categoryId: string | null;

    @ApiProperty({ description: 'Nome do produto' })
    name: string;

    @ApiPropertyOptional({ description: 'Descrição do produto' })
    description: string | null;

    @ApiProperty({ description: 'Preço de venda' })
    price: number;

    @ApiPropertyOptional({ description: 'Preço de custo' })
    costPrice: number | null;

    @ApiPropertyOptional({ description: 'URL da imagem' })
    imageUrl: string | null;

    @ApiPropertyOptional({ description: 'Tempo de preparo em minutos' })
    preparationTime: number | null;

    @ApiProperty({ description: 'Se está disponível para venda' })
    isAvailable: boolean;

    @ApiProperty({ description: 'Se está ativo' })
    isActive: boolean;

    @ApiProperty({ description: 'Data de criação' })
    createdAt: Date;

    @ApiPropertyOptional({ description: 'Nome da categoria' })
    categoryName?: string;

    static fromEntity(product: Product & { category?: { name: string } | null }): ProductResponseDto {
        const dto = new ProductResponseDto();
        dto.id = product.id;
        dto.tenantId = product.tenantId;
        dto.categoryId = product.categoryId;
        dto.name = product.name;
        dto.description = product.description;
        dto.price = product.price instanceof Decimal ? product.price.toNumber() : Number(product.price);
        dto.costPrice = product.costPrice ? (product.costPrice instanceof Decimal ? product.costPrice.toNumber() : Number(product.costPrice)) : null;
        dto.imageUrl = product.imageUrl;
        dto.preparationTime = product.preparationTime;
        dto.isAvailable = product.isAvailable;
        dto.isActive = product.isActive;
        dto.createdAt = product.createdAt;

        if (product.category) {
            dto.categoryName = product.category.name;
        }

        return dto;
    }

    static fromEntities(products: (Product & { category?: { name: string } | null })[]): ProductResponseDto[] {
        return products.map(p => ProductResponseDto.fromEntity(p));
    }
}
