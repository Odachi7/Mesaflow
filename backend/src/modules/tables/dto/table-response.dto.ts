import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Table } from '@prisma/client';

export class TableResponseDto {
    @ApiProperty({ description: 'ID único da mesa' })
    id: string;

    @ApiProperty({ description: 'ID do tenant' })
    tenantId: string;

    @ApiProperty({ description: 'Número da mesa' })
    tableNumber: string;

    @ApiProperty({ description: 'Capacidade de pessoas' })
    capacity: number;

    @ApiProperty({ description: 'Status da mesa', enum: ['available', 'occupied', 'reserved', 'maintenance'] })
    status: string;

    @ApiPropertyOptional({ description: 'Código QR da mesa' })
    qrCode: string | null;

    @ApiProperty({ description: 'Data de criação' })
    createdAt: Date;

    static fromEntity(table: Table): TableResponseDto {
        const dto = new TableResponseDto();
        dto.id = table.id;
        dto.tenantId = table.tenantId;
        dto.tableNumber = table.tableNumber;
        dto.capacity = table.capacity;
        dto.status = table.status;
        dto.qrCode = table.qrCode;
        dto.createdAt = table.createdAt;
        return dto;
    }

    static fromEntities(tables: Table[]): TableResponseDto[] {
        return tables.map(t => TableResponseDto.fromEntity(t));
    }
}
