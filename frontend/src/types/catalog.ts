export interface Category {
    id: string;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
    type: string;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    imageUrl?: string;
    categoryId: string;
    category?: Category;
    isActive: boolean;
    isAvailable: boolean;
    preparationTime?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryDto {
    name: string;
    description?: string;
    displayOrder?: number;
    type?: string;
    isActive?: boolean;
}

export interface UpdateCategoryDto extends Partial(CreateCategoryDto) { }

export interface CreateProductDto {
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    imageUrl?: string;
    categoryId?: string;
    isActive?: boolean;
}

export interface UpdateProductDto extends Partial(CreateProductDto) { }
