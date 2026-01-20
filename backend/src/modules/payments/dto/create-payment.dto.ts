import { IsString, IsNumber, IsUUID, Min, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
    @ApiProperty({ description: 'ID do pedido' })
    @IsUUID()
    orderId: string;

    @ApiProperty({
        description: 'Método de pagamento',
        enum: ['cash', 'credit_card', 'debit_card', 'pix', 'voucher'],
        example: 'cash',
    })
    @IsIn(['cash', 'credit_card', 'debit_card', 'pix', 'voucher'])
    paymentMethod: string;

    @ApiProperty({ description: 'Valor do pagamento', example: 50.00 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    @Type(() => Number)
    amount: number;
}
