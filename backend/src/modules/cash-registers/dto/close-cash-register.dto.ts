import { IsNumber, IsOptional, Min, MaxLength, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CloseCashRegisterDto {
    @ApiProperty({ description: 'Valor final do caixa', example: 500.00 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Type(() => Number)
    finalAmount: number;

    @ApiPropertyOptional({ description: 'Observações de fechamento' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}
