export class Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}