import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../websockets/notifications.gateway';

@Injectable()
export class OrderEventsListener {
    private readonly logger = new Logger(OrderEventsListener.name);

    constructor(
        private emailService: EmailService,
        private notificationsGateway: NotificationsGateway,
    ) { }

    @EventPattern('order.created')
    async handleOrderCreated(@Payload() data: any) {
        try {
            this.logger.log(`Order created event received: ${data.orderId}`);

            const userId = data.userId || data.customerId;
            const userEmail = data.customerEmail || data.email;

            if (userEmail) {
                // Send order confirmation email
                await this.emailService.sendOrderConfirmation(userEmail, {
                    orderId: data.orderId,
                    customerName: data.customerName || 'Valued Customer',
                    totalPrice: data.total || data.totalPrice,
                    subtotal: data.subtotal,
                    tax: data.tax,
                    shipping: data.shipping,
                    currency: data.currency || 'MAD',
                    items: data.items || [],
                });
            }

            if (userId) {
                // Send WebSocket notification
                this.notificationsGateway.notifyUser(
                    userId,
                    'order.created',
                    {
                        orderId: data.orderId,
                        total: data.total || data.totalPrice,
                        currency: data.currency || 'MAD',
                        status: 'PENDING',
                    },
                );
            }

            // Notify admins
            this.notificationsGateway.notifyAdmins('order.created', {
                orderId: data.orderId,
                userId: userId,
                total: data.total || data.totalPrice,
                currency: data.currency || 'MAD',
                itemCount: data.items?.length || 0,
            });

            this.logger.log(`Order notifications sent: ${data.orderId}`);
        } catch (error) {
            this.logger.error(
                `Failed to handle order created: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    @EventPattern('order.cancelled')
    async handleOrderCancelled(@Payload() data: any) {
        try {
            this.logger.log(`Order cancelled event received: ${data.orderId}`);

            const userId = data.userId || data.customerId;

            if (userId) {
                // Send WebSocket notification
                this.notificationsGateway.notifyUser(
                    userId,
                    'order.cancelled',
                    {
                        orderId: data.orderId,
                        reason: data.reason || 'Order was cancelled',
                    },
                );
            }

            // Notify admins
            this.notificationsGateway.notifyAdmins('order.cancelled', {
                orderId: data.orderId,
                userId: userId,
                reason: data.reason,
            });

            this.logger.log(`Order cancellation notifications sent: ${data.orderId}`);
        } catch (error) {
            this.logger.error(
                `Failed to handle order cancelled: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }
}