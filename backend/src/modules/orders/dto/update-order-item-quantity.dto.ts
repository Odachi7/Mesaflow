import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateOrderItemQuantityDto {
    @ApiProperty({ description: 'Nova quantidade', example: 3 })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    quantity: number;
}
