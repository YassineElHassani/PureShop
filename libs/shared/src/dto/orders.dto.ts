import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MoneyDto, PaginationQueryDto } from './common.dto';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export class OrderItemDto {
  @IsUUID()
  productId: string;

  @IsString()
  sku: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @ValidateNested()
  @Type(() => MoneyDto)
  unitPrice: MoneyDto;
}

export class OrderItemResponseDto extends OrderItemDto {
  id: string;

  @ValidateNested()
  @Type(() => MoneyDto)
  totalPrice: MoneyDto;

  product?: {
    name: string;
    description: string;
  };
}

export class CreateOrderDto {
  @IsUUID()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  shippingCost?: MoneyDto;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class CancelOrderDto {
  @IsString()
  reason: string;
}

export class OrderTotalsDto {
  subtotal: MoneyDto;
  tax: MoneyDto;
  shipping: MoneyDto;
  total: MoneyDto;
}

export class OrderResponseDto {
  id: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totals: OrderTotalsDto;
  items: OrderItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class GetUserOrdersDto extends PaginationQueryDto {
  @IsUUID()
  userId: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
