
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { CashRegistersService } from './cash-registers.service';
import { OpenSessionDto, CloseSessionDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';

@ApiTags('Cash Registers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cash-registers')
export class CashRegistersController {
    constructor(private readonly cashRegistersService: CashRegistersService) { }

    @Get()
    @ApiOperation({ summary: 'Listar todos os caixas' })
    findAll(@Tenant() tenantId: string) {
        return this.cashRegistersService.findAll(tenantId);
    }

    @Get('me/session')
    @ApiOperation({ summary: 'Verificar sessão ativa do usuário atual' })
    getMySession(
        @Tenant() tenantId: string,
        @Request() req: any,
    ) {
        return this.cashRegistersService.getActiveSession(tenantId, req.user.userId);
    }

    @Get('me/session/summary')
    @ApiOperation({ summary: 'Obter resumo da sessão atual (vendas e totais)' })
    getSessionSummary(
        @Tenant() tenantId: string,
        @Request() req: any,
    ) {
        return this.cashRegistersService.getSessionSummary(tenantId, req.user.userId);
    }

    @Post('session/open')
    @ApiOperation({ summary: 'Abrir sessão de caixa' })
    openSession(
        @Tenant() tenantId: string,
        @Request() req: any,
        @Body() dto: OpenSessionDto,
    ) {
        return this.cashRegistersService.openSession(tenantId, req.user.userId, dto);
    }

    @Post('session/:id/close')
    @ApiOperation({ summary: 'Fechar sessão de caixa' })
    closeSession(
        @Tenant() tenantId: string,
        @Request() req: any,
        @Param('id') id: string,
        @Body() dto: CloseSessionDto,
    ) {
        return this.cashRegistersService.closeSession(tenantId, req.user.userId, id, dto);
    }
}
