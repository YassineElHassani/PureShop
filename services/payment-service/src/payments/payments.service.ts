import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { StripeService, CheckoutSessionData } from '../config/stripe.config';
import { CreateCheckoutDto, Currency } from './dto/create-checkout.dto';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private prisma = new PrismaClient();

    constructor(
        private stripeService: StripeService,
        @Inject('RABBITMQ_SERVICE') private rabbitClient: ClientProxy,
    ) {
        this.prisma = new PrismaClient();
    }

    async onModuleDestroy() {
        await this.prisma.$disconnect();
    }

    async createCheckoutSession(
        createCheckoutDto: CreateCheckoutDto,
    ): Promise<{ sessionUrl: string; sessionId: string }> {
        try {
            // Check for idempotency
            if (process.env.IDEMPOTENCY_KEY_ENABLED === 'true') {
                const idempotencyKey = `order_${createCheckoutDto.orderId}`;
                const existingIdempotency =
                    await this.prisma.paymentIdempotency.findUnique({
                        where: { idempotencyKey },
                    });

                if (existingIdempotency) {
                    const result = JSON.parse(existingIdempotency.result);
                    this.logger.log(
                        `Returning cached checkout session for order: ${createCheckoutDto.orderId}`,
                    );
                    return result;
                }
            }

            // Check if payment already exists
            const existingPayment = await this.prisma.payment.findUnique({
                where: { orderId: createCheckoutDto.orderId },
            });

            if (
                existingPayment &&
                (existingPayment.status === 'SUCCEEDED' ||
                    existingPayment.status === 'PROCESSING')
            ) {
                throw new ConflictException('Payment already processed for this order');
            }

            // Create Stripe checkout session
            const checkoutData: CheckoutSessionData = {
                orderId: createCheckoutDto.orderId,
                userId: createCheckoutDto.userId,
                customerEmail: createCheckoutDto.customerEmail,
                subtotal: createCheckoutDto.subtotal,
                tax: createCheckoutDto.tax,
                shipping: createCheckoutDto.shipping,
                total: createCheckoutDto.total,
                currency: createCheckoutDto.currency || Currency.MAD,
                items: createCheckoutDto.items,
            };

            const session = await this.stripeService.createCheckoutSession(
                checkoutData,
            );

            // Save payment record
            const payment = await this.prisma.payment.create({
                data: {
                    orderId: createCheckoutDto.orderId,
                    stripeSessionId: session.id,
                    customerId: createCheckoutDto.userId,
                    amount: createCheckoutDto.total,
                    currency: createCheckoutDto.currency || Currency.MAD,
                    status: 'PENDING',
                    idempotencyKey:
                        process.env.IDEMPOTENCY_KEY_ENABLED === 'true'
                            ? `order_${createCheckoutDto.orderId}`
                            : undefined,
                    metadata: JSON.stringify({
                        userId: createCheckoutDto.userId,
                        customerEmail: createCheckoutDto.customerEmail,
                        subtotal: createCheckoutDto.subtotal,
                        tax: createCheckoutDto.tax,
                        shipping: createCheckoutDto.shipping,
                        total: createCheckoutDto.total,
                        items: createCheckoutDto.items,
                        createdAt: new Date().toISOString(),
                    }),
                },
            });

            // Log transaction
            await this.logPaymentEvent(payment.id, 'checkout_session_created', {
                sessionId: session.id,
                amount: createCheckoutDto.total,
            });

            const response = {
                sessionUrl: session.url || '',
                sessionId: session.id,
            };

            // Cache for idempotency
            if (process.env.IDEMPOTENCY_KEY_ENABLED === 'true') {
                await this.prisma.paymentIdempotency.create({
                    data: {
                        idempotencyKey: `order_${createCheckoutDto.orderId}`,
                        orderId: createCheckoutDto.orderId,
                        result: JSON.stringify(response),
                    },
                });
            }

            this.logger.log(`Checkout session created for order: ${payment.orderId}`);
            return response;
        } catch (error) {
            this.logger.error(
                `Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    async getPaymentByOrderId(orderId: string): Promise<any> {
        try {
            const payment = await this.prisma.payment.findUnique({
                where: { orderId },
                include: {
                    paymentLogs: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                },
            });

            if (!payment) {
                throw new NotFoundException(`Payment not found for order: ${orderId}`);
            }

            return this.formatPaymentResponse(payment);
        } catch (error) {
            this.logger.error(
                `Failed to get payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    async getPaymentBySessionId(sessionId: string): Promise<any> {
        try {
            const payment = await this.prisma.payment.findUnique({
                where: { stripeSessionId: sessionId },
            });

            if (!payment) {
                throw new NotFoundException(
                    `Payment not found for session: ${sessionId}`,
                );
            }

            return this.formatPaymentResponse(payment);
        } catch (error) {
            this.logger.error(
                `Failed to get payment by session: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    async handleSessionCompleted(
        sessionId: string,
        paymentIntentId: string,
    ): Promise<void> {
        try {
            const payment = await this.prisma.payment.findUnique({
                where: { stripeSessionId: sessionId },
            });

            if (!payment) {
                throw new NotFoundException(
                    `Payment not found for session: ${sessionId}`,
                );
            }

            const updatedPayment = await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'PROCESSING',
                    paymentIntentId,
                },
            });

            await this.logPaymentEvent(
                payment.id,
                'checkout_session_completed',
                {
                    sessionId,
                    paymentIntentId,
                },
            );

            this.logger.log(
                `Session completed for order: ${payment.orderId}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to handle session completed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    async handlePaymentSucceeded(
        paymentIntentId: string,
        chargeId: string,
        receiptUrl?: string,
    ): Promise<void> {
        try {
            const payment = await this.prisma.payment.findUnique({
                where: { paymentIntentId },
            });

            if (!payment) {
                throw new NotFoundException(
                    `Payment not found for intent: ${paymentIntentId}`,
                );
            }

            const updatedPayment = await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'SUCCEEDED',
                    chargeId,
                    receiptUrl,
                },
            });

            await this.logPaymentEvent(payment.id, 'payment_intent_succeeded', {
                paymentIntentId,
                chargeId,
                receiptUrl,
            });

            // Emit success event
            this.rabbitClient.emit('payment.succeeded', {
                orderId: payment.orderId,
                paymentId: payment.id,
                customerId: payment.customerId,
                amount: payment.amount,
                paymentIntentId,
                chargeId,
                receiptUrl,
                timestamp: new Date(),
            });

            this.logger.log(
                `Payment succeeded for order: ${payment.orderId}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to handle payment succeeded: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    async handlePaymentFailed(
        paymentIntentId: string,
        failureReason: string,
        failureCode?: string,
    ): Promise<void> {
        try {
            const payment = await this.prisma.payment.findUnique({
                where: { paymentIntentId },
            });

            if (!payment) {
                // Try to find by session ID as fallback
                const sessionPayment = await this.prisma.payment.findFirst({
                    where: {
                        paymentIntentId: null,
                        status: 'PROCESSING',
                    },
                });

                if (!sessionPayment) {
                    this.logger.warn(
                        `Payment not found for intent: ${paymentIntentId}`,
                    );
                    return;
                }

                const updatedPayment = await this.prisma.payment.update({
                    where: { id: sessionPayment.id },
                    data: {
                        status: 'FAILED',
                        failureReason,
                        failureCode,
                    },
                });

                await this.logPaymentEvent(
                    sessionPayment.id,
                    'payment_intent_failed',
                    {
                        failureReason,
                        failureCode,
                    },
                );

                this.rabbitClient.emit('payment.failed', {
                    orderId: sessionPayment.orderId,
                    paymentId: sessionPayment.id,
                    customerId: sessionPayment.customerId,
                    failureReason,
                    failureCode,
                    timestamp: new Date(),
                });

                return;
            }

            const updatedPayment = await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'FAILED',
                    failureReason,
                    failureCode,
                },
            });

            await this.logPaymentEvent(payment.id, 'payment_intent_failed', {
                failureReason,
                failureCode,
            });

            // Emit failure event
            this.rabbitClient.emit('payment.failed', {
                orderId: payment.orderId,
                paymentId: payment.id,
                customerId: payment.customerId,
                failureReason,
                failureCode,
                timestamp: new Date(),
            });

            this.logger.log(
                `Payment failed for order: ${payment.orderId}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to handle payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    async refundPayment(orderId: string, reason?: string): Promise<void> {
        try {
            const payment = await this.prisma.payment.findUnique({
                where: { orderId },
            });

            if (!payment) {
                throw new NotFoundException(`Payment not found for order: ${orderId}`);
            }

            if (payment.status !== 'SUCCEEDED') {
                throw new BadRequestException(
                    'Only succeeded payments can be refunded',
                );
            }

            if (!payment.paymentIntentId) {
                throw new BadRequestException(
                    'Payment intent ID is required for refund',
                );
            }

            // Create refund via Stripe
            const refund = await this.stripeService.refundPayment(
                payment.paymentIntentId,
            );

            // Update payment record
            const refundedPayment = await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'REFUNDED',
                    refundedAmount: payment.amount,
                    refundedAt: new Date(),
                },
            });

            // Log refund
            await this.logPaymentEvent(payment.id, 'refund_created', {
                refundId: refund.id,
                amount: refund.amount / 100,
                reason,
            });

            // Emit refund event
            this.rabbitClient.emit('payment.refunded', {
                orderId: payment.orderId,
                paymentId: payment.id,
                customerId: payment.customerId,
                refundId: refund.id,
                amount: refund.amount / 100,
                reason,
                timestamp: new Date(),
            });

            this.logger.log(
                `Payment refunded for order: ${orderId}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to refund payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    async getPaymentLogs(paymentId: string): Promise<any[]> {
        try {
            return await this.prisma.paymentLog.findMany({
                where: { paymentId },
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            this.logger.error(
                `Failed to get payment logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    private async logPaymentEvent(
        paymentId: string,
        eventType: string,
        metadata?: Record<string, any>,
    ): Promise<void> {
        try {
            await this.prisma.paymentLog.create({
                data: {
                    paymentId,
                    eventType,
                    status: 'COMPLETED',
                    metadata: metadata ? JSON.stringify(metadata) : null,
                },
            });
        } catch (error) {
            this.logger.error(
                `Failed to log payment event: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    private formatPaymentResponse(payment: any) {
        return {
            id: payment.id,
            orderId: payment.orderId,
            stripeSessionId: payment.stripeSessionId,
            paymentIntentId: payment.paymentIntentId,
            customerId: payment.customerId,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            receiptUrl: payment.receiptUrl,
            failureReason: payment.failureReason,
            failureCode: payment.failureCode,
            refundedAmount: payment.refundedAmount,
            refundedAt: payment.refundedAt,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
        };
    }
}