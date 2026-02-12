
import { IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloseSessionDto {
    @ApiProperty({ description: 'Valor final em caixa (conferência)' })
    @IsNumber()
    @Min(0)
    closingBalance: number;
}
