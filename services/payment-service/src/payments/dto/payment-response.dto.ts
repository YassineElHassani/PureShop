export class PaymentResponseDto {
  id: string;
  orderId: string;
  stripeSessionId: string;
  paymentIntentId?: string;
  customerId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  receiptUrl?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}