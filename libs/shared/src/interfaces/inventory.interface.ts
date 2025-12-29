import { IAuditTrail, IBaseEntity } from './common.interface';

export enum StockReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  RELEASED = 'RELEASED',
}

export interface IStock extends IBaseEntity, IAuditTrail {
  productId: string;
  sku: string;
  quantity: number;
  reserved: number;
  lowStockThreshold: number;
}

export interface IStockAvailability {
  productId: string;
  sku: string;
  totalQuantity: number;
  reserved: number;
  available: number;
  isAvailable: boolean;
  lowStockThreshold: number;
  isLowStock: boolean;
}

export interface IStockReservation extends IBaseEntity, IAuditTrail {
  productId: string;
  sku: string;
  orderId: string;
  quantity: number;
  status: StockReservationStatus;
  expiresAt?: Date;
}
