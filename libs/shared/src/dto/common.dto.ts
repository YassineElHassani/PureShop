import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CurrencyCode } from '../interfaces/common.interface';
import type { SortOrder } from '../interfaces/common.interface';

export class MoneyDto {
  @IsNumber()
  amount: number;

  @IsEnum(CurrencyCode)
  currency: CurrencyCode;
}

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()$)
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}

export class NumericRangeDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  max?: number;
}
