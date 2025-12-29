import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MoneyDto, NumericRangeDto, PaginationQueryDto } from './common.dto';
import { ProductStatus, ProductVisibility } from '../interfaces/catalog.interface';

export class ProductMediaDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  description: string;

  @IsString()
  sku: string;

  @ValidateNested()
  @Type(() => MoneyDto)
  price: MoneyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  compareAtPrice?: MoneyDto;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsEnum(ProductVisibility)
  @IsOptional()
  visibility?: ProductVisibility;

  @IsUUID()
  categoryId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductMediaDto)
  @IsOptional()
  media?: ProductMediaDto[];

  @IsObject()
  @IsOptional()
  attributes?: Record<string, string>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initialStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @ValidateNested()
  @Type(() => MoneyDto)
  @IsOptional()
  price?: MoneyDto;

  @ValidateNested()
  @Type(() => MoneyDto)
  @IsOptional()
  compareAtPrice?: MoneyDto;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsEnum(ProductVisibility)
  @IsOptional()
  visibility?: ProductVisibility;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductMediaDto)
  @IsOptional()
  media?: ProductMediaDto[];

  @IsObject()
  @IsOptional()
  attributes?: Record<string, string>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;
}

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsUUID()
  @IsOptional()
  parentId?: string | null;
}

export class ProductFilterDto extends PaginationQueryDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NumericRangeDto)
  priceRange?: NumericRangeDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsEnum(ProductStatus, { each: true })
  @IsOptional()
  statuses?: ProductStatus[];

  @IsEnum(ProductVisibility)
  @IsOptional()
  visibility?: ProductVisibility;

  @IsBoolean()
  @IsOptional()
  onlyActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;
}

export class ProductInventorySummaryDto {
  sku: string;
  available: number;
  reserved: number;
  lowStockThreshold: number;
  isLowStock: boolean;
}

export class ProductPricingDto {
  basePrice: MoneyDto;
  compareAtPrice?: MoneyDto;
  taxRate: number;
  taxAmount: MoneyDto;
  totalPrice: MoneyDto;
}

export class CategorySummaryDto {
  id: string;
  name: string;
  slug: string;
}

export class ProductResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  tags: string[];
  price: MoneyDto;
  pricing?: ProductPricingDto;
  categoryId: string;
  category?: CategorySummaryDto;
  media?: ProductMediaDto[];
  attributes?: Record<string, string>;
  metadata?: Record<string, unknown>;
  inventory?: ProductInventorySummaryDto;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  parentId?: string | null;
  parent?: CategorySummaryDto;
  children?: CategorySummaryDto[];
  productCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
