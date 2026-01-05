export class Payment {
  id: string;
  orderId: string;
  stripeSessionId: string;
  paymentIntentId?: string;
  customerId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  receiptEmail?: string;
  receiptUrl?: string;
  failureReason?: string;
  failureCode?: string;
  idempotencyKey?: string;
  metadata?: string;
  chargeId?: string;
  refundedAmount: number;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}