import { Controller, Get } from '@nestjs/common';
import { OrdersServiceService } from './orders-service.service';

@Controller()
export class OrdersServiceController {
  constructor(private readonly orderServiceService: OrdersServiceService) { }

  @Get()
  getHello(): string {
    return this.orderServiceService.getHello();
  }
}
