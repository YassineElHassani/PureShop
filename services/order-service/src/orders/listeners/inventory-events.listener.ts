import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrdersService } from '../orders.service';

@Injectable()
export class InventoryEventsListener {
    private readonly logger = new Logger(InventoryEventsListener.name);

    constructor(private ordersService: OrdersService) { }

    @EventPattern('inventory.stock.reserved')
    async handleStockReserved(@Payload() data: any) {
        try {
            this.logger.log(
                `Stock reserved event received for order: ${data.orderId}`,
            );

            // Update order status or metadata if needed
            // This is where you could add additional logic for stock confirmation
        } catch (error) {
            this.logger.error(
                `Failed to handle stock reserved event: ${error.message}`,
            );
        }
    }

    @EventPattern('inventory.stock.released')
    async handleStockReleased(@Payload() data: any) {
        try {
            this.logger.log(
                `Stock released event received for order: ${data.orderId}`,
            );

            // This event is triggered when stock is released (e.g., order cancelled)
        } catch (error) {
            this.logger.error(
                `Failed to handle stock released event: ${error.message}`,
            );
        }
    }
}