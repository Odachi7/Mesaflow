import { IsString, IsOptional, IsUUID, IsNumber, Min, MaxLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOrderDto {
    @ApiPropertyOptional({ description: 'ID da mesa', example: 'table-001' })
    @IsOptional()
    @IsUUID()
    tableId?: string;

    @ApiProperty({ description: 'Número da comanda', example: 'CMD-001' })
    @IsString()
    @MaxLength(50)
    orderNumber: string;

    @ApiPropertyOptional({ description: 'ID do garçom responsável' })
    @IsOptional()
    @IsUUID()
    waiterId?: string;

    @ApiPropertyOptional({ description: 'ID do cliente' })
    @IsOptional()
    @IsUUID()
    customerId?: string;

    @ApiPropertyOptional({ description: 'Nome do cliente', example: 'João Silva' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    customerName?: string;

    @ApiPropertyOptional({
        description: 'Tipo do pedido',
        example: 'dine_in',
        enum: ['dine_in', 'takeout', 'delivery'],
    })
    @IsOptional()
    @IsIn(['dine_in', 'takeout', 'delivery'])
    orderType?: string;

    @ApiPropertyOptional({ description: 'Observações do pedido' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}
