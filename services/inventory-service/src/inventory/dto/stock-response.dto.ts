export class StockResponseDto {
  id: string;
  sku: string;
  quantity: number;
  reserved: number;
  available: number; // quantity - reserved
  createdAt: Date;
  updatedAt: Date;
}