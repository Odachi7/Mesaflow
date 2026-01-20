import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto, UpdateTableStatusDto, TableResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Tables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tables')
export class TablesController {
    constructor(private readonly tablesService: TablesService) { }

    @Post()
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Criar uma nova mesa' })
    @ApiResponse({
        status: 201,
        description: 'Mesa criada com sucesso',
        type: TableResponseDto,
    })
    @ApiResponse({ status: 409, description: 'Mesa com mesmo número já existe' })
    create(
        @Tenant() tenantId: string,
        @Body() createTableDto: CreateTableDto,
    ): Promise<TableResponseDto> {
        return this.tablesService.create(tenantId, createTableDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as mesas' })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: ['available', 'occupied', 'reserved', 'maintenance'],
        description: 'Filtrar por status',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de mesas',
        type: [TableResponseDto],
    })
    findAll(
        @Tenant() tenantId: string,
        @Query('status') status?: string,
    ): Promise<TableResponseDto[]> {
        return this.tablesService.findAll(tenantId, status);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar mesa por ID' })
    @ApiParam({ name: 'id', description: 'ID da mesa' })
    @ApiResponse({
        status: 200,
        description: 'Mesa encontrada',
        type: TableResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Mesa não encontrada' })
    findOne(
        @Tenant() tenantId: string,
        @Param('id') id: string,
    ): Promise<TableResponseDto> {
        return this.tablesService.findOne(tenantId, id);
    }

    @Patch(':id')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Atualizar mesa' })
    @ApiParam({ name: 'id', description: 'ID da mesa' })
    @ApiResponse({
        status: 200,
        description: 'Mesa atualizada com sucesso',
        type: TableResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Mesa não encontrada' })
    @ApiResponse({ status: 409, description: 'Mesa com mesmo número já existe' })
    update(
        @Tenant() tenantId: string,
        @Param('id') id: string,
        @Body() updateTableDto: UpdateTableDto,
    ): Promise<TableResponseDto> {
        return this.tablesService.update(tenantId, id, updateTableDto);
    }

    @Patch(':id/status')
    @Roles('admin', 'manager', 'waiter')
    @ApiOperation({ summary: 'Atualizar status da mesa' })
    @ApiParam({ name: 'id', description: 'ID da mesa' })
    @ApiResponse({
        status: 200,
        description: 'Status atualizado com sucesso',
        type: TableResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Mesa não encontrada' })
    updateStatus(
        @Tenant() tenantId: string,
        @Param('id') id: string,
        @Body() updateStatusDto: UpdateTableStatusDto,
    ): Promise<TableResponseDto> {
        return this.tablesService.updateStatus(tenantId, id, updateStatusDto);
    }

    @Delete(':id')
    @Roles('admin', 'manager')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir mesa' })
    @ApiParam({ name: 'id', description: 'ID da mesa' })
    @ApiResponse({ status: 204, description: 'Mesa excluída com sucesso' })
    @ApiResponse({ status: 404, description: 'Mesa não encontrada' })
    @ApiResponse({
        status: 409,
        description: 'Mesa possui pedidos associados',
    })
    remove(
        @Tenant() tenantId: string,
        @Param('id') id: string,
    ): Promise<void> {
        return this.tablesService.remove(tenantId, id);
    }

    @Post(':id/regenerate-qrcode')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Regenerar QR Code da mesa' })
    @ApiParam({ name: 'id', description: 'ID da mesa' })
    @ApiResponse({
        status: 200,
        description: 'QR Code regenerado com sucesso',
        type: TableResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Mesa não encontrada' })
    regenerateQRCode(
        @Tenant() tenantId: string,
        @Param('id') id: string,
    ): Promise<TableResponseDto> {
        return this.tablesService.regenerateQRCode(tenantId, id);
    }
}
