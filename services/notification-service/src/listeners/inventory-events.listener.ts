import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../websockets/notifications.gateway';

@Injectable()
export class InventoryEventsListener {
    private readonly logger = new Logger(InventoryEventsListener.name);
    private readonly stockThreshold = 10;

    constructor(
        private emailService: EmailService,
        private notificationsGateway: NotificationsGateway,
    ) { }

    @EventPattern('inventory.stock.low')
    async handleLowStock(@Payload() data: any) {
        try {
            this.logger.log(`Low stock event received: ${data.sku}`);

            // Notify admins via WebSocket
            this.notificationsGateway.notifyAdmins('inventory.stock.low', {
                sku: data.sku,
                productName: data.productName,
                currentStock: data.currentStock,
                threshold: this.stockThreshold,
            });

            // Send email alert if below critical threshold
            if (data.currentStock <= 5) {
                await this.emailService.sendStockAlert(
                    ['admin@youshop.com'],
                    {
                        productSku: data.sku,
                        productName: data.productName,
                        currentStock: data.currentStock,
                        threshold: this.stockThreshold,
                    },
                );

                this.logger.log(
                    `Stock alert email sent for SKU: ${data.sku}`,
                );
            }

            this.logger.log(
                `Low stock notifications sent for SKU: ${data.sku}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to handle low stock: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    @EventPattern('inventory.stock.reserved')
    async handleStockReserved(@Payload() data: any) {
        try {
            this.logger.log(`Stock reserved event received: ${data.sku}`);

            // Notify admins for high-value orders
            if (data.quantity > 5) {
                this.notificationsGateway.notifyAdmins(
                    'inventory.stock.reserved',
                    {
                        sku: data.sku,
                        quantity: data.quantity,
                        orderId: data.orderId,
                    },
                );
            }

            this.logger.log(
                `Stock reservation notifications sent: ${data.orderId}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to handle stock reserved: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    @EventPattern('inventory.stock.released')
    async handleStockReleased(@Payload() data: any) {
        try {
            this.logger.log(`Stock released event received: ${data.sku}`);

            this.notificationsGateway.notifyAdmins('inventory.stock.released', {
                sku: data.sku,
                quantity: data.quantity,
                orderId: data.orderId,
                reason: data.reason || 'Order cancelled',
            });

            this.logger.log(
                `Stock release notifications sent: ${data.orderId}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to handle stock released: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }
}