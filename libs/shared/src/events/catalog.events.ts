import { ProductStatus, ProductVisibility } from '../interfaces/catalog.interface';
import { IMoney } from '../interfaces/common.interface';

export class ProductCreatedEvent {
  constructor(
    public readonly productId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly sku: string,
    public readonly price: IMoney,
    public readonly categoryId: string,
    public readonly status: ProductStatus,
    public readonly visibility: ProductVisibility,
    public readonly tags: string[],
    public readonly initialStock: number,
    public readonly lowStockThreshold?: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class ProductUpdatedEvent {
  constructor(
    public readonly productId: string,
    public readonly changes: Record<string, unknown>,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class ProductDeletedEvent {
  constructor(
    public readonly productId: string,
    public readonly hardDelete: boolean,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class CategoryCreatedEvent {
  constructor(
    public readonly categoryId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly parentId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class CategoryUpdatedEvent {
  constructor(
    public readonly categoryId: string,
    public readonly changes: Record<string, unknown>,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class CategoryDeletedEvent {
  constructor(
    public readonly categoryId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
