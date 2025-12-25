export class Order {
  id: string;
  userId: string;
  status: string;
  subtotal: number;
  tax: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}