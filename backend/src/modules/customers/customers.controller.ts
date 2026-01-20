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
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Post()
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Cadastrar cliente' })
    @ApiResponse({ status: 201, description: 'Cliente criado', type: CustomerResponseDto })
    @ApiResponse({ status: 409, description: 'Email ou CPF já existe' })
    create(
        @Tenant() tenantId: string,
        @Body() createCustomerDto: CreateCustomerDto,
    ): Promise<CustomerResponseDto> {
        return this.customersService.create(tenantId, createCustomerDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar clientes' })
    @ApiQuery({ name: 'search', required: false, description: 'Buscar por nome, email ou telefone' })
    @ApiResponse({ status: 200, description: 'Lista de clientes', type: [CustomerResponseDto] })
    findAll(
        @Tenant() tenantId: string,
        @Query('search') search?: string,
    ): Promise<CustomerResponseDto[]> {
        return this.customersService.findAll(tenantId, search);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar cliente por ID' })
    @ApiParam({ name: 'id', description: 'ID do cliente' })
    @ApiResponse({ status: 200, description: 'Cliente encontrado', type: CustomerResponseDto })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
    findOne(
        @Tenant() tenantId: string,
        @Param('id') id: string,
    ): Promise<CustomerResponseDto> {
        return this.customersService.findOne(tenantId, id);
    }

    @Patch(':id')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Atualizar cliente' })
    @ApiParam({ name: 'id', description: 'ID do cliente' })
    @ApiResponse({ status: 200, description: 'Cliente atualizado', type: CustomerResponseDto })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
    @ApiResponse({ status: 409, description: 'Email ou CPF já existe' })
    update(
        @Tenant() tenantId: string,
        @Param('id') id: string,
        @Body() updateCustomerDto: UpdateCustomerDto,
    ): Promise<CustomerResponseDto> {
        return this.customersService.update(tenantId, id, updateCustomerDto);
    }

    @Delete(':id')
    @Roles('admin', 'manager')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir cliente' })
    @ApiParam({ name: 'id', description: 'ID do cliente' })
    @ApiResponse({ status: 204, description: 'Cliente excluído com sucesso' })
    @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
    remove(
        @Tenant() tenantId: string,
        @Param('id') id: string,
    ): Promise<void> {
        return this.customersService.remove(tenantId, id);
    }
}
