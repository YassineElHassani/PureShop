import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['PENDING', 'PAID', 'CANCELLED', 'COMPLETED'])
  @IsNotEmpty()
  status: string;
}