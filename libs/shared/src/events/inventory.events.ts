import { StockAdjustmentReason, StockReleaseReason } from '../dto/inventory.dto';

export class StockCreatedEvent {
  constructor(
    public readonly productId: string,
    public readonly sku: string,
    public readonly quantity: number,
    public readonly reserved: number,
    public readonly lowStockThreshold: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class StockUpdatedEvent {
  constructor(
    public readonly productId: string,
    public readonly sku: string,
    public readonly previousQuantity: number,
    public readonly newQuantity: number,
    public readonly previousReserved: number,
    public readonly newReserved: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class StockAdjustedEvent {
  constructor(
    public readonly productId: string,
    public readonly sku: string,
    public readonly adjustment: number,
    public readonly reason: StockAdjustmentReason,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class StockReservedEvent {
  constructor(
    public readonly orderId: string,
    public readonly items: Array<{
      productId: string;
      sku: string;
      quantity: number;
      availableAfter: number;
      reservedAfter: number;
    }>,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class StockReleasedEvent {
  constructor(
    public readonly orderId: string,
    public readonly reason: StockReleaseReason,
    public readonly items: Array<{
      productId: string;
      sku: string;
      quantity: number;
      availableAfter: number;
      reservedAfter: number;
    }>,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class LowStockAlertEvent {
  constructor(
    public readonly productId: string,
    public readonly sku: string,
    public readonly currentStock: number,
    public readonly threshold: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class OutOfStockEvent {
  constructor(
    public readonly productId: string,
    public readonly sku: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
