import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStockDto {
  @ApiProperty({ description: 'Quantity to set', example: 100, minimum: 0 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'Reserved quantity', example: 5, minimum: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  reserved?: number;
}
