import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);
    private prisma = new PrismaClient();

    constructor() {
        this.prisma = new PrismaClient();
    }

    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }

    async logWebhookEvent(event: Stripe.Event): Promise<void> {
        try {
            const object = event.data.object as any;

            if (object.payment_intent) {
                const payment = await this.prisma.payment.findUnique({
                    where: { paymentIntentId: object.payment_intent },
                });

                if (payment) {
                    await this.prisma.paymentLog.create({
                        data: {
                            paymentId: payment.id,
                            eventType: event.type,
                            stripeEventId: event.id,
                            status: 'RECEIVED',
                            metadata: JSON.stringify(event.data),
                        },
                    });
                }
            } else if (object.metadata?.orderId) {
                const payment = await this.prisma.payment.findUnique({
                    where: { orderId: object.metadata.orderId },
                });

                if (payment) {
                    await this.prisma.paymentLog.create({
                        data: {
                            paymentId: payment.id,
                            eventType: event.type,
                            stripeEventId: event.id,
                            status: 'RECEIVED',
                            metadata: JSON.stringify(event.data),
                        },
                    });
                }
            }

            this.logger.log(`Webhook event logged: ${event.type} - ${event.id}`);
        } catch (error) {
            this.logger.error(
                `Failed to log webhook event: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    async markWebhookAsProcessed(
        stripeEventId: string,
        status: string,
    ): Promise<void> {
        try {
            const logs = await this.prisma.paymentLog.findMany({
                where: { stripeEventId },
            });

            for (const log of logs) {
                await this.prisma.paymentLog.update({
                    where: { id: log.id },
                    data: { status },
                });
            }

            this.logger.log(`Webhook marked as processed: ${stripeEventId}`);
        } catch (error) {
            this.logger.error(
                `Failed to mark webhook as processed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    async getWebhookLogs(
        limit: number = 50,
        offset: number = 0,
    ): Promise<any[]> {
        try {
            return await this.prisma.paymentLog.findMany({
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            });
        } catch (error) {
            this.logger.error(
                `Failed to get webhook logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }
}