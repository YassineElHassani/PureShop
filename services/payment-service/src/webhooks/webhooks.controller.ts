import {
    Controller,
    Post,
    Get,
    Req,
    Headers,
    Query,
    BadRequestException,
    Logger,
    Inject,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import Stripe from 'stripe';

interface RawBodyRequest extends Request {
    rawBody?: string | Buffer;
}
import { StripeService } from '../config/stripe.config';
import { WebhooksService } from './webhooks.service';
import { PaymentsService } from '../payments/payments.service';

@Controller('webhooks')
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    constructor(
        private stripeService: StripeService,
        private webhooksService: WebhooksService,
        private paymentsService: PaymentsService,
        @Inject('RABBITMQ_SERVICE') private rabbitClient: ClientProxy,
    ) { }

    @Post('stripe')
    @HttpCode(HttpStatus.OK)
    async handleStripeWebhook(
        @Req() request: RawBodyRequest,
        @Headers('stripe-signature') signature: string,
    ): Promise<{ received: boolean }> {
        const body = request.rawBody as string | Buffer;

        if (!signature) {
            throw new BadRequestException('Missing Stripe signature');
        }

        try {
            const event = this.stripeService.verifyWebhookSignature(body, signature);

            // Log webhook event
            await this.webhooksService.logWebhookEvent(event);

            // Handle different event types
            switch (event.type) {
                case 'checkout.session.completed':
                    await this.handleSessionCompleted(event.data.object as Stripe.Checkout.Session);
                    break;

                case 'payment_intent.succeeded':
                    await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
                    break;

                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
                    break;

                case 'charge.refunded':
                    await this.handleRefund(event.data.object as Stripe.Charge);
                    break;

                default:
                    this.logger.log(`Unhandled event type: ${event.type}`);
            }

            // Mark webhook as processed
            await this.webhooksService.markWebhookAsProcessed(event.id, 'PROCESSED');

            return { received: true };
        } catch (error) {
            this.logger.error(
                `Webhook verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw new BadRequestException('Webhook signature verification failed');
        }
    }

    @Get('logs')
    async getWebhookLogs(
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {
        const limitNum = limit ? parseInt(limit, 10) : 50;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        return this.webhooksService.getWebhookLogs(limitNum, offsetNum);
    }

    private async handleSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
        try {
            const orderId = session.metadata?.orderId;
            const paymentIntentId = typeof session.payment_intent === 'string' 
                ? session.payment_intent 
                : session.payment_intent?.id;

            if (!orderId) {
                this.logger.warn(
                    `Session completed but no orderId in metadata: ${session.id}`,
                );
                return;
            }

            await this.paymentsService.handleSessionCompleted(
                session.id,
                paymentIntentId || '',
            );

            this.logger.log(`Session completed for order: ${orderId}`);
        } catch (error) {
            this.logger.error(
                `Failed to handle session completed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        try {
            const chargeId = paymentIntent.latest_charge && typeof paymentIntent.latest_charge === 'string'
                ? paymentIntent.latest_charge
                : (paymentIntent.latest_charge as Stripe.Charge)?.id;
            
            // Retrieve the charge to get receipt_url if needed
            let receiptUrl = '';
            if (chargeId) {
                const charge = await this.stripeService.getStripeClient().charges.retrieve(chargeId);
                receiptUrl = charge.receipt_url || '';
            }

            await this.paymentsService.handlePaymentSucceeded(
                paymentIntent.id,
                chargeId || '',
                receiptUrl || '',
            );

            this.logger.log(
                `Payment succeeded: ${paymentIntent.id}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to handle payment succeeded: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        try {
            const failureMessage =
                paymentIntent.last_payment_error?.message || 'Unknown error';
            const failureCode =
                paymentIntent.last_payment_error?.code || 'unknown_error';

            await this.paymentsService.handlePaymentFailed(
                paymentIntent.id,
                failureMessage,
                failureCode,
            );

            this.logger.log(
                `Payment failed: ${paymentIntent.id} - ${failureMessage}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to handle payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }

    private async handleRefund(charge: Stripe.Charge): Promise<void> {
        try {
            this.rabbitClient.emit('payment.refunded', {
                chargeId: charge.id,
                amount: ((charge.amount_refunded || 0) / 100).toFixed(2),
                currency: charge.currency,
                refundedAt: new Date(),
            });

            this.logger.log(
                `Refund processed for charge: ${charge.id}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to handle refund: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw error;
        }
    }
}