import { OrderStatus, PaymentStatus } from '../dto/orders.dto';
import { IMoney } from '../interfaces/common.interface';

export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly items: Array<{
      productId: string;
      sku: string;
      quantity: number;
      unitPrice: IMoney;
    }>,
    public readonly totals: {
      subtotal: IMoney;
      tax: IMoney;
      shipping: IMoney;
      total: IMoney;
    },
    public readonly paymentStatus: PaymentStatus,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class OrderStatusChangedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly oldStatus: OrderStatus,
    public readonly newStatus: OrderStatus,
    public readonly paymentStatus: PaymentStatus,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class OrderPaymentStatusChangedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly oldStatus: PaymentStatus,
    public readonly newStatus: PaymentStatus,
    public readonly transactionId?: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class OrderPaidEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly amount: IMoney,
    public readonly transactionId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class OrderCancelledEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly reason: string,
    public readonly items: Array<{
      productId: string;
      sku: string;
      quantity: number;
    }>,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class OrderShippedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly trackingNumber: string,
    public readonly carrier: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class OrderDeliveredEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
