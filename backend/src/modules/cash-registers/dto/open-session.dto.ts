
import { IsString, IsNumber, IsNotEmpty, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OpenSessionDto {
    @ApiProperty({ description: 'ID do caixa a ser aberto' })
    @IsUUID()
    @IsNotEmpty()
    cashRegisterId: string;

    @ApiProperty({ description: 'Valor inicial em caixa' })
    @IsNumber()
    @Min(0)
    openingBalance: number;
}
