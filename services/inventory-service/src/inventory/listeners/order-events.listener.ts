import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InventoryService } from '../inventory.service';

@Injectable()
export class OrderEventsListener {
  private readonly logger = new Logger(OrderEventsListener.name);

  constructor(private inventoryService: InventoryService) {}

  @EventPattern('order.created')
  async handleOrderCreated(@Payload() data: any) {
    try {
      this.logger.log(`Order created event received: ${data.orderId}`);

      // For each item in the order, reserve stock
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          await this.inventoryService.reserveStock({
            sku: item.sku,
            quantity: item.quantity,
            orderId: data.orderId,
            reason: `Order created: ${data.orderId}`,
          });
        }
      }

      this.logger.log(`Stock reserved for order: ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to handle order created event: ${error.message}`);
    }
  }

  @EventPattern('order.cancelled')
  async handleOrderCancelled(@Payload() data: any) {
    try {
      this.logger.log(`Order cancelled event received: ${data.orderId}`);

      // For each item in the order, release stock
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          await this.inventoryService.releaseStock({
            sku: item.sku,
            quantity: item.quantity,
            orderId: data.orderId,
            reason: `Order cancelled: ${data.orderId}`,
          });
        }
      }

      this.logger.log(`Stock released for order: ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Failed to handle order cancelled event: ${error.message}`);
    }
  }
}