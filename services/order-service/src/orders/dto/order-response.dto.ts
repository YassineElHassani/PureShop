export class OrderResponseDto {
  id: string;
  userId: string;
  status: string;
  subtotal: number;
  tax: number;
  totalPrice: number;
  items: {
    id: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}