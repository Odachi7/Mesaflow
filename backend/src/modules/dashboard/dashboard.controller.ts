
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('overview')
    @ApiOperation({ summary: 'Métricas gerais do dia (Vendas, Pedidos, Mesas)' })
    getOverview(@Tenant() tenantId: string) {
        return this.dashboardService.getOverview(tenantId);
    }

    @Get('top-products')
    @ApiOperation({ summary: 'Produtos mais vendidos' })
    getTopProducts(@Tenant() tenantId: string) {
        return this.dashboardService.getTopProducts(tenantId);
    }

    @Get('recent')
    @ApiOperation({ summary: 'Atividade recente (últimos pedidos)' })
    getRecentActivity(@Tenant() tenantId: string) {
        return this.dashboardService.getRecentActivity(tenantId);
    }
}
