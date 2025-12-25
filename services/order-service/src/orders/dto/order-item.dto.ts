import { IsString, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;
}