import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class WebhookEventDto {
  @IsString()
  type: string;

  @IsString()
  id: string;

  @IsObject()
  data: Record<string, any>;

  @IsNumber()
  @IsOptional()
  created?: number;

  @IsString()
  @IsOptional()
  request?: string;
}