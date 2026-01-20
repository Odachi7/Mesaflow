import { IsOptional, IsUUID, IsBoolean, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class FilterProductsDto {
    @ApiPropertyOptional({ description: 'Filtrar por categoria' })
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @ApiPropertyOptional({ description: 'Filtrar apenas disponíveis' })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    onlyAvailable?: boolean;

    @ApiPropertyOptional({ description: 'Filtrar apenas ativos' })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    onlyActive?: boolean;

    @ApiPropertyOptional({ description: 'Buscar por nome' })
    @IsOptional()
    @IsString()
    search?: string;
}
