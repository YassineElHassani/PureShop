import {
  ArrayMinSize,
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

export enum StockAdjustmentReason {
  DELIVERY = 'DELIVERY',
  MANUAL = 'MANUAL',
  RETURN = 'RETURN',
  CORRECTION = 'CORRECTION',
}

export enum StockReleaseReason {
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
}

export class StockItemDto {
  @IsUUID()
  productId: string;

  @IsString()
  sku: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateStockDto {
  @IsUUID()
  productId: string;

  @IsString()
  sku: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reserved?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;
}

export class UpdateStockDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reserved?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;
}

export class AdjustStockDto {
  @IsUUID()
  productId: string;

  @IsString()
  sku: string;

  @IsNumber()
  adjustment: number;

  @IsEnum(StockAdjustmentReason)
  reason: StockAdjustmentReason;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ReserveStockDto {
  @IsUUID()
  orderId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockItemDto)
  items: StockItemDto[];

  @IsOptional()
  @IsString()
  reason?: string;
}

export class ReleaseStockDto {
  @IsUUID()
  orderId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockItemDto)
  items: StockItemDto[];

  @IsEnum(StockReleaseReason)
  reason: StockReleaseReason;

  @IsOptional()
  @IsString()
  note?: string;
}

export class StockResponseDto {
  id: string;
  productId: string;
  sku: string;
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CheckStockDto {
  @IsUUID()
  productId: string;

  @IsString()
  sku: string;
}
