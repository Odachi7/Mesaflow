import { IsString, IsOptional, IsBoolean, IsInt, Min, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ description: 'Nome da categoria', example: 'Bebidas' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({ description: 'Descrição da categoria', example: 'Bebidas geladas e quentes' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({ description: 'Ordem de exibição', example: 1, default: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    displayOrder?: number;

    @ApiPropertyOptional({ description: 'Se a categoria está ativa', default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
