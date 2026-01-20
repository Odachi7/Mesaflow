import { IsUUID, IsInt, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddOrderItemDto {
    @ApiProperty({ description: 'ID do produto' })
    @IsUUID()
    productId: string;

    @ApiProperty({ description: 'Quantidade', example: 2 })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    quantity: number;

    @ApiPropertyOptional({ description: 'Observações do item' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    notes?: string;
}
