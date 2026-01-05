import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested, IsOptional, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum Currency {
  MAD = 'mad',
  USD = 'usd',
  EUR = 'eur',
}

export class CheckoutItemDto {
  @ApiProperty({ description: 'Product ID', example: 'prod_123' })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Product SKU', example: 'SKU-001' })
  @IsNotEmpty()
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Product name', example: 'Premium T-Shirt' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Quantity', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price in smallest currency unit (e.g., cents)', example: 5000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Total price for this item (quantity * unitPrice)', example: 10000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalPrice: number;
}

export class CreateCheckoutDto {
  @ApiProperty({ description: 'Order ID', example: 'ord_123' })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Cart items', type: [CheckoutItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiProperty({ description: 'Subtotal amount', example: 10000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiProperty({ description: 'Tax amount', example: 2000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  tax: number;

  @ApiProperty({ description: 'Shipping cost', example: 3000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  shipping: number;

  @ApiProperty({ description: 'Total amount (subtotal + tax + shipping)', example: 15000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  total: number;

  @ApiProperty({ description: 'Currency code', enum: Currency, example: Currency.MAD, default: Currency.MAD })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;
}
