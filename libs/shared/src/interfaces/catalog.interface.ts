import {
  IAuditTrail,
  IBaseEntity,
  IMoney,
  IPaginatedResponse,
  IPaginationQuery,
  IQueryRange,
} from './common.interface';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum ProductVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export interface IProductMedia {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  metadata?: Record<string, unknown>;
}

export interface IProductInventorySummary {
  sku: string;
  available: number;
  reserved: number;
  lowStockThreshold: number;
  isLowStock: boolean;
}

export interface IProductPricing {
  basePrice: IMoney;
  compareAtPrice?: IMoney;
  taxRate: number;
  taxAmount: IMoney;
  totalPrice: IMoney;
}

export interface ICategory extends IBaseEntity, IAuditTrail {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  parentId?: string | null;
  parent?: Pick<ICategory, 'id' | 'name' | 'slug'>;
  children?: Array<Pick<ICategory, 'id' | 'name' | 'slug'>>;
  productCount?: number;
  metadata?: Record<string, unknown>;
}

export interface IProduct extends IBaseEntity, IAuditTrail {
  name: string;
  slug: string;
  description: string;
  sku: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  tags: string[];
  price: IMoney;
  pricing?: IProductPricing;
  categoryId: string;
  category?: Pick<ICategory, 'id' | 'name' | 'slug'>;
  media?: IProductMedia[];
  attributes?: Record<string, string>;
  metadata?: Record<string, unknown>;
  inventory?: IProductInventorySummary;
}

export type ProductListItem = Pick<
  IProduct,
  'id' | 'name' | 'slug' | 'status' | 'visibility' | 'tags'
> & {
  price: IMoney;
  thumbnail?: string;
  categoryName?: string;
  inventory?: IProductInventorySummary;
};

export interface IProductListQuery extends IPaginationQuery {
  categoryId?: string;
  price?: IQueryRange;
  tags?: string[];
  statuses?: ProductStatus[];
  visibility?: ProductVisibility;
  onlyActive?: boolean;
  minStock?: number;
}

export type IProductListResponse = IPaginatedResponse<ProductListItem>;
export type ICategoryListResponse = IPaginatedResponse<ICategory>;
