import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsPositive,
  IsArray,
  ValidateNested,
  IsEmail,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Currency {
  MAD = 'MAD',
  USD = 'USD',
  EUR = 'EUR',
}

export class CheckoutItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  unitPrice: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  totalPrice: number;
}

export class CreateCheckoutDto {
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  subtotal: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  tax: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  shipping: number;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  total: number;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  @IsNotEmpty()
  items: CheckoutItemDto[];
}