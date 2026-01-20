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
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
    CreateOrderDto,
    AddOrderItemDto,
    UpdateOrderItemQuantityDto,
    ApplyDiscountDto,
    OrderResponseDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @Roles('admin', 'manager', 'waiter')
    @ApiOperation({ summary: 'Criar um novo ped ido/comanda' })
    @ApiResponse({
        status: 201,
        description: 'Pedido criado com sucesso',
        type: OrderResponseDto,
    })
    create(
        @Tenant() tenantId: string,
        @Body() createOrderDto: CreateOrderDto,
    ): Promise<OrderResponseDto> {
        return this.ordersService.create(tenantId, createOrderDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar pedidos' })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'tableId', required: false })
    @ApiResponse({ status: 200, type: [OrderResponseDto] })
    findAll(
        @Tenant() tenantId: string,
        @Query('status') status?: string,
        @Query('tableId') tableId?: string,
    ): Promise<OrderResponseDto[]> {
        return this.ordersService.findAll(tenantId, status, tableId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar pedido por ID' })
    @ApiResponse({ status: 200, type: OrderResponseDto })
    findOne(
        @Tenant() tenantId: string,
        @Param('id') id: string,
    ): Promise<OrderResponseDto> {
        return this.ordersService.findOne(tenantId, id);
    }

    @Post(':id/items')
    @Roles('admin', 'manager', 'waiter')
    @ApiOperation({ summary: 'Adicionar item ao pedido' })
    @ApiResponse({ status: 200, type: OrderResponseDto })
    addItem(
        @Tenant() tenantId: string,
        @Param('id') orderId: string,
        @Body() addItemDto: AddOrderItemDto,
    ): Promise<OrderResponseDto> {
        return this.ordersService.addItem(tenantId, orderId, addItemDto);
    }

    @Patch(':id/items/:itemId/quantity')
    @Roles('admin', 'manager', 'waiter')
    @ApiOperation({ summary: 'Atualizar quantidade de item' })
    @ApiResponse({ status: 200, type: OrderResponseDto })
    updateItemQuantity(
        @Tenant() tenantId: string,
        @Param('id') orderId: string,
        @Param('itemId') itemId: string,
        @Body() updateDto: UpdateOrderItemQuantityDto,
    ): Promise<OrderResponseDto> {
        return this.ordersService.updateItemQuantity(tenantId, orderId, itemId, updateDto);
    }

    @Delete(':id/items/:itemId')
    @Roles('admin', 'manager', 'waiter')
    @ApiOperation({ summary: 'Remover item do pedido' })
    @ApiResponse({ status: 200, type: OrderResponseDto })
    removeItem(
        @Tenant() tenantId: string,
        @Param('id') orderId: string,
        @Param('itemId') itemId: string,
    ): Promise<OrderResponseDto> {
        return this.ordersService.removeItem(tenantId, orderId, itemId);
    }

    @Patch(':id/discount')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Aplicar desconto ao pedido' })
    @ApiResponse({ status: 200, type: OrderResponseDto })
    applyDiscount(
        @Tenant() tenantId: string,
        @Param('id') orderId: string,
        @Body() discountDto: ApplyDiscountDto,
    ): Promise<OrderResponseDto> {
        return this.ordersService.applyDiscount(tenantId, orderId, discountDto);
    }

    @Post(':id/close')
    @Roles('admin', 'manager', 'waiter')
    @ApiOperation({ summary: 'Fechar pedido' })
    @ApiResponse({ status: 200, type: OrderResponseDto })
    closeOrder(
        @Tenant() tenantId: string,
        @Param('id') orderId: string,
    ): Promise<OrderResponseDto> {
        return this.ordersService.closeOrder(tenantId, orderId);
    }

    @Post(':id/cancel')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Cancelar pedido' })
    @ApiResponse({ status: 200, type: OrderResponseDto })
    cancelOrder(
        @Tenant() tenantId: string,
        @Param('id') orderId: string,
    ): Promise<OrderResponseDto> {
        return this.ordersService.cancelOrder(tenantId, orderId);
    }
}
