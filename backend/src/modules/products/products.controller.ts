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
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, FilterProductsDto, ProductResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Criar um novo produto' })
    @ApiResponse({
        status: 201,
        description: 'Produto criado com sucesso',
        type: ProductResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Dados inválidos ou categoria inválida' })
    @ApiResponse({ status: 409, description: 'Produto com mesmo nome já existe' })
    create(
        @Tenant() tenantId: string,
        @Body() createProductDto: CreateProductDto,
    ): Promise<ProductResponseDto> {
        return this.productsService.create(tenantId, createProductDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os produtos' })
    @ApiResponse({
        status: 200,
        description: 'Lista de produtos',
        type: [ProductResponseDto],
    })
    findAll(
        @Tenant() tenantId: string,
        @Query() filters: FilterProductsDto,
    ): Promise<ProductResponseDto[]> {
        return this.productsService.findAll(tenantId, filters);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar produto por ID' })
    @ApiParam({ name: 'id', description: 'ID do produto' })
    @ApiResponse({
        status: 200,
        description: 'Produto encontrado',
        type: ProductResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Produto não encontrado' })
    findOne(
        @Tenant() tenantId: string,
        @Param('id') id: string,
    ): Promise<ProductResponseDto> {
        return this.productsService.findOne(tenantId, id);
    }

    @Patch(':id')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Atualizar produto' })
    @ApiParam({ name: 'id', description: 'ID do produto' })
    @ApiResponse({
        status: 200,
        description: 'Produto atualizado com sucesso',
        type: ProductResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Produto não encontrado' })
    @ApiResponse({ status: 409, description: 'Produto com mesmo nome já existe' })
    update(
        @Tenant() tenantId: string,
        @Param('id') id: string,
        @Body() updateProductDto: UpdateProductDto,
    ): Promise<ProductResponseDto> {
        return this.productsService.update(tenantId, id, updateProductDto);
    }

    @Delete(':id')
    @Roles('admin', 'manager')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir produto' })
    @ApiParam({ name: 'id', description: 'ID do produto' })
    @ApiResponse({ status: 204, description: 'Produto excluído com sucesso' })
    @ApiResponse({ status: 404, description: 'Produto não encontrado' })
    @ApiResponse({
        status: 409,
        description: 'Produto possui itens de pedido associados',
    })
    remove(
        @Tenant() tenantId: string,
        @Param('id') id: string,
    ): Promise<void> {
        return this.productsService.remove(tenantId, id);
    }

    @Patch(':id/toggle-availability')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Alternar disponibilidade do produto para venda' })
    @ApiParam({ name: 'id', description: 'ID do produto' })
    @ApiResponse({
        status: 200,
        description: 'Disponibilidade alterada com sucesso',
        type: ProductResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Produto não encontrado' })
    toggleAvailability(
        @Tenant() tenantId: string,
        @Param('id') id: string,
    ): Promise<ProductResponseDto> {
        return this.productsService.toggleAvailability(tenantId, id);
    }

    @Patch(':id/toggle-active')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Alternar status ativo/inativo do produto' })
    @ApiParam({ name: 'id', description: 'ID do produto' })
    @ApiResponse({
        status: 200,
        description: 'Status alterado com sucesso',
        type: ProductResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Produto não encontrado' })
    toggleActive(
        @Tenant() tenantId: string,
        @Param('id') id: string,
    ): Promise<ProductResponseDto> {
        return this.productsService.toggleActive(tenantId, id);
    }
}
