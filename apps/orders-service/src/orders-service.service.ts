import { Injectable } from "@nestjs/common";

@Injectable()
export class OrdersServiceService {
  getHello(): string {
    return 'Orders Service is running';
  }
}
