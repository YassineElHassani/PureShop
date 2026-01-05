import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../websockets/notifications.gateway';

@Injectable()
export class PaymentEventsListener {
    private readonly logger = new Logger(PaymentEventsListener.name);

    constructor(
        private emailService: EmailService,
        private notificationsGateway: NotificationsGateway,
    ) { }

    @EventPattern('payment.succeeded')
    async handlePaymentSucceeded(@Payload() data: any) {
        try {
            this.logger.log(`Payment succeeded event received: ${data.orderId}`);

            const userId = data.userId || data.customerId;
            const userEmail = data.customerEmail || data.email;

            if (userEmail) {
                // Send email notification
                await this.emailService.sendPaymentSuccess(userEmail, {
                    orderId: data.orderId,
                    amount: data.amount,
                    currency: data.currency,
                    transactionId: data.paymentIntentId,
                    receiptUrl: data.receiptUrl,
                });
            }

            if (userId) {
                // Send WebSocket notification
                this.notificationsGateway.notifyUser(
                    userId,
                    'payment.success',
                    {
                        orderId: data.orderId,
                        amount: data.amount,
                        status: 'PAID',
                    },
                );
            }

            this.logger.log(
                `Payment success notifications sent for order: ${data.orderId}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to handle payment succeeded: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    @EventPattern('payment.failed')
    async handlePaymentFailed(@Payload() data: any) {
        try {
            this.logger.log(`Payment failed event received: ${data.orderId}`);

            const userId = data.userId || data.customerId;
            const userEmail = data.customerEmail || data.email;

            if (userEmail) {
                // Send email notification
                await this.emailService.sendPaymentFailed(userEmail, {
                    orderId: data.orderId,
                    failureReason: data.failureReason,
                    failureCode: data.failureCode,
                });
            }

            if (userId) {
                // Send WebSocket notification
                this.notificationsGateway.notifyUser(
                    userId,
                    'payment.failed',
                    {
                        orderId: data.orderId,
                        failureReason: data.failureReason,
                        failureCode: data.failureCode,
                    },
                );
            }

            this.logger.log(
                `Payment failure notifications sent for order: ${data.orderId}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to handle payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    @EventPattern('payment.refunded')
    async handlePaymentRefunded(@Payload() data: any) {
        try {
            this.logger.log(`Payment refunded event received: ${data.orderId}`);

            const userId = data.userId || data.customerId;

            if (userId) {
                // Send WebSocket notification to user
                this.notificationsGateway.notifyUser(
                    userId,
                    'payment.refunded',
                    {
                        orderId: data.orderId,
                        amount: data.amount,
                        refundId: data.refundId,
                        currency: data.currency,
                    },
                );
            }

            // Notify admins
            this.notificationsGateway.notifyAdmins('payment.refunded', {
                orderId: data.orderId,
                userId: userId,
                amount: data.amount,
                currency: data.currency,
                refundId: data.refundId,
                timestamp: new Date(),
            });

            this.logger.log(
                `Refund notifications sent for order: ${data.orderId}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to handle payment refunded: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }
}