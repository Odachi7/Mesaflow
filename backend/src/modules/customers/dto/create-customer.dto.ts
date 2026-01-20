import { IsString, IsEmail, IsOptional, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
    @ApiProperty({ description: 'Nome completo', example: 'João Silva' })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({ description: 'Email', example: 'joao@email.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'Telefone', example: '(11) 98765-4321' })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @ApiPropertyOptional({ description: 'CPF', example: '123.456.789-00' })
    @IsOptional()
    @IsString()
    @MaxLength(14)
    cpf?: string;

    @ApiPropertyOptional({ description: 'Endereço completo' })
    @IsOptional()
    @IsString()
    @MaxLength(300)
    address?: string;
}
