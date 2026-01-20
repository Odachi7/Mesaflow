import { IsString, IsOptional, IsNumber, IsBoolean, IsUUID, Min, MaxLength, MinLength, IsDecimal } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @ApiPropertyOptional({ description: 'ID da categoria', example: 'cat-001' })
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @ApiProperty({ description: 'Nome do produto', example: 'Coca-Cola 350ml' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({ description: 'Descrição do produto', example: 'Refrigerante Coca-Cola lata' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiProperty({ description: 'Preço de venda', example: 6.00 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Type(() => Number)
    price: number;

    @ApiPropertyOptional({ description: 'Preço de custo', example: 3.50 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Type(() => Number)
    costPrice?: number;

    @ApiPropertyOptional({ description: 'URL da imagem', example: 'https://example.com/coca.jpg' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    imageUrl?: string;

    @ApiPropertyOptional({ description: 'Tempo de preparo em minutos', example: 15 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    preparationTime?: number;

    @ApiPropertyOptional({ description: 'Se o produto está disponível para venda', default: true })
    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;

    @ApiPropertyOptional({ description: 'Se o produto está ativo', default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
