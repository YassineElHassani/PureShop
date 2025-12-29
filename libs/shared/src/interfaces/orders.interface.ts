import { OrderStatus, PaymentStatus } from '../dto/orders.dto';
import { IAuditTrail, IBaseEntity, IMoney } from './common.interface';

export interface IOrderItem extends IBaseEntity, IAuditTrail {
  orderId: string;
  productId: string;
  sku: string;
  quantity: number;
  unitPrice: IMoney;
  totalPrice: IMoney;
}

export interface IOrderTotals {
  subtotal: IMoney;
  tax: IMoney;
  shipping: IMoney;
  total: IMoney;
}

export interface IOrder extends IBaseEntity, IAuditTrail {
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totals: IOrderTotals;
  items: IOrderItem[];
  cancellationReason?: string;
}

export interface IOrderSummary {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: IMoney;
  itemCount: number;
  createdAt: Date;
}
