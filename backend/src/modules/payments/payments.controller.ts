import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Query,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    @Roles('admin', 'manager', 'cashier')
    @ApiOperation({ summary: 'Registrar pagamento' })
    @ApiResponse({ status: 201, type: PaymentResponseDto })
    create(
        @Tenant() tenantId: string,
        @Body() createPaymentDto: CreatePaymentDto,
        @Request() req: any,
    ): Promise<PaymentResponseDto> {
        const cashierId = req.user?.userId;
        return this.paymentsService.create(tenantId, createPaymentDto, cashierId);
    }

    @Get()
    @ApiOperation({ summary: 'Listar pagamentos' })
    @ApiQuery({ name: 'orderId', required: false })
    @ApiResponse({ status: 200, type: [PaymentResponseDto] })
    findAll(
        @Tenant() tenantId: string,
        @Query('orderId') orderId?: string,
    ): Promise<PaymentResponseDto[]> {
        return this.paymentsService.findAll(tenantId, orderId);
    }

    @Get('order/:orderId/summary')
    @ApiOperation({ summary: 'Resumo de pagamentos do pedido' })
    @ApiParam({ name: 'orderId' })
    getOrderSummary(
        @Tenant() tenantId: string,
        @Param('orderId') orderId: string,
    ) {
        return this.paymentsService.getOrderPaymentSummary(tenantId, orderId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar pagamento por ID' })
    @ApiParam({ name: 'id' })
    @ApiResponse({ status: 200, type: PaymentResponseDto })
    findOne(
        @Tenant() tenantId: string,
        @Param('id') id: string,
    ): Promise<PaymentResponseDto> {
        return this.paymentsService.findOne(tenantId, id);
    }
}
