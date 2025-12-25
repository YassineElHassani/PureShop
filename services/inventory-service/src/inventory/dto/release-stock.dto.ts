import { IsString, IsNumber, IsNotEmpty, IsPositive, IsOptional } from 'class-validator';

export class ReleaseStockDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}