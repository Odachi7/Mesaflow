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
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post()
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Criar uma nova categoria' })
    @ApiResponse({
        status: 201,
        description: 'Categoria criada com sucesso',
        type: CategoryResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 409, description: 'Categoria com mesmo nome já existe' })
    create(
        @Tenant() tenantId: string,
        @Body() createCategoryDto: CreateCategoryDto,
    ): Promise<CategoryResponseDto> {
        return this.categoriesService.create(tenantId, createCategoryDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as categorias' })
    @ApiQuery({
        name: 'includeInactive',
        required: false,
        type: Boolean,
        description: 'Incluir categorias inativas',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de categorias',
        type: [CategoryResponseDto],
    })
    findAll(
        @Tenant() tenantId: string,
        @Query('includeInactive') includeInactive?: string,
    ): Promise<CategoryResponseDto[]> {
        return this.categoriesService.findAll(tenantId, includeInactive === 'true');
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar categoria por ID' })
    @ApiParam({ name: 'id', description: 'ID da categoria' })
    @ApiResponse({
        status: 200,
        description: 'Categoria encontrada',
        type: CategoryResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
    findOne(
        @Tenant() tenantId: string,
        @Param('id') id: string,
    ): Promise<CategoryResponseDto> {
        return this.categoriesService.findOne(tenantId, id);
    }

    @Patch(':id')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Atualizar categoria' })
    @ApiParam({ name: 'id', description: 'ID da categoria' })
    @ApiResponse({
        status: 200,
        description: 'Categoria atualizada com sucesso',
        type: CategoryResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
    @ApiResponse({ status: 409, description: 'Categoria com mesmo nome já existe' })
    update(
        @Tenant() tenantId: string,
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<CategoryResponseDto> {
        return this.categoriesService.update(tenantId, id, updateCategoryDto);
    }

    @Delete(':id')
    @Roles('admin', 'manager')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Excluir categoria' })
    @ApiParam({ name: 'id', description: 'ID da categoria' })
    @ApiResponse({ status: 204, description: 'Categoria excluída com sucesso' })
    @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
    @ApiResponse({
        status: 409,
        description: 'Categoria possui produtos associados',
    })
    remove(
        @Tenant() tenantId: string,
        @Param('id') id: string,
    ): Promise<void> {
        return this.categoriesService.remove(tenantId, id);
    }

    @Post('reorder')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Reordenar categorias' })
    @ApiResponse({
        status: 200,
        description: 'Categorias reordenadas com sucesso',
        type: [CategoryResponseDto],
    })
    reorder(
        @Tenant() tenantId: string,
        @Body() categoryIds: string[],
    ): Promise<CategoryResponseDto[]> {
        return this.categoriesService.reorder(tenantId, categoryIds);
    }

    @Patch(':id/toggle-active')
    @Roles('admin', 'manager')
    @ApiOperation({ summary: 'Alternar status ativo/inativo da categoria' })
    @ApiParam({ name: 'id', description: 'ID da categoria' })
    @ApiResponse({
        status: 200,
        description: 'Status alterado com sucesso',
        type: CategoryResponseDto,
    })
    @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
    toggleActive(
        @Tenant() tenantId: string,
        @Param('id') id: string,
    ): Promise<CategoryResponseDto> {
        return this.categoriesService.toggleActive(tenantId, id);
    }
}
