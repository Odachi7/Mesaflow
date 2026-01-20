import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Customer } from '@prisma/client';

export class CustomerResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    tenantId: string;

    @ApiProperty()
    name: string;

    @ApiPropertyOptional()
    email: string | null;

    @ApiPropertyOptional()
    phone: string | null;

    @ApiPropertyOptional()
    cpf: string | null;

    @ApiProperty()
    totalOrders: number;

    @ApiProperty()
    createdAt: Date;

    static fromEntity(customer: Customer & { _count?: { orders: number } }): CustomerResponseDto {
        const dto = new CustomerResponseDto();
        dto.id = customer.id;
        dto.tenantId = customer.tenantId;
        dto.name = customer.name;
        dto.email = customer.email;
        dto.phone = customer.phone;
        dto.cpf = customer.cpf;
        dto.totalOrders = customer._count?.orders || 0;
        dto.createdAt = customer.createdAt;
        return dto;
    }

    static fromEntities(customers: (Customer & { _count?: { orders: number } })[]): CustomerResponseDto[] {
        return customers.map(c => CustomerResponseDto.fromEntity(c));
    }
}
