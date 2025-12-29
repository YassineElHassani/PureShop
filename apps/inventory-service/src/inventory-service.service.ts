import { Injectable } from "@nestjs/common";

@Injectable()
export class InventoryServiceService {
  getHello(): string {
    return 'Inventory Service is running';
  }
}
