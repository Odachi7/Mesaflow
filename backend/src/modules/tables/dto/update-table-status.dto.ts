import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTableStatusDto {
    @ApiProperty({
        description: 'Novo status da mesa',
        example: 'occupied',
        enum: ['available', 'occupied', 'reserved', 'maintenance'],
    })
    @IsIn(['available', 'occupied', 'reserved', 'maintenance'])
    status: string;
}
