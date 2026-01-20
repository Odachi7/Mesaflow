import { IsString, IsInt, IsOptional, Min, Max, MaxLength, MinLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTableDto {
    @ApiProperty({ description: 'Número da mesa', example: '1' })
    @IsString()
    @MinLength(1)
    @MaxLength(10)
    tableNumber: string;

    @ApiProperty({ description: 'Capacidade de pessoas', example: 4 })
    @IsInt()
    @Min(1)
    @Max(50)
    @Type(() => Number)
    capacity: number;

    @ApiPropertyOptional({
        description: 'Status inicial da mesa',
        example: 'available',
        default: 'available',
        enum: ['available', 'occupied', 'reserved', 'maintenance'],
    })
    @IsOptional()
    @IsIn(['available', 'occupied', 'reserved', 'maintenance'])
    status?: string;
}
