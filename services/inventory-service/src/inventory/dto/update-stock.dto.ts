import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class UpdateStockDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  reserved?: number;

  @IsString()
  @IsOptional()
  reason?: string;
}