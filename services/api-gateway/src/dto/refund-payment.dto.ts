import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiProperty({ 
    description: 'Reason for refund', 
    example: 'Customer requested cancellation',
    required: false 
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
