
import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderItemStatusDto {
    @ApiProperty({
        description: 'Novo status do item',
        enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
    })
    @IsString()
    @IsNotEmpty()
    @IsEnum(['pending', 'preparing', 'ready', 'delivered', 'cancelled'])
    status: string;
}
