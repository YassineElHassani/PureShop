import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

export interface CheckoutItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CheckoutSessionData {
  orderId: string;
  userId: string;
  customerEmail: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  items: CheckoutItem[];
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const apiVersion = process.env.STRIPE_API_VERSION;

    if (!secretKey) {
      this.logger.error('STRIPE_SECRET_KEY is not configured');
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: (apiVersion as Stripe.LatestApiVersion) || '2023-10-16',
    });

    this.logger.log('Stripe service initialized');
  }

  getStripeClient(): Stripe {
    return this.stripe;
  }

  async createCheckoutSession(
    data: CheckoutSessionData,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        data.items.map((item) => ({
          price_data: {
            currency: data.currency.toLowerCase(),
            product_data: {
              name: item.name,
              description: `Order ${data.orderId}`,
              metadata: {
                productId: item.productId,
                sku: item.sku,
              },
            },
            unit_amount: Math.round(item.unitPrice * 100), // Convert to cents
          },
          quantity: item.quantity,
        }));

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/orders/${data.orderId}?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/orders/${data.orderId}?status=cancel`,
        customer_email: data.customerEmail,
        metadata: {
          orderId: data.orderId,
          userId: data.userId,
          subtotal: data.subtotal.toString(),
          tax: data.tax.toString(),
          shipping: data.shipping.toString(),
          total: data.total.toString(),
          currency: data.currency,
        },
      });

      this.logger.log(
        `Checkout session created: ${session.id} for order: ${data.orderId}`,
      );
      return session;
    } catch (error) {
      this.logger.error(
        `Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve session ${sessionId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve payment intent ${paymentIntentId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async refundPayment(paymentIntentId: string): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
      });

      this.logger.log(
        `Refund created: ${refund.id} for payment intent: ${paymentIntentId}`,
      );
      return refund;
    } catch (error) {
      this.logger.error(
        `Failed to refund payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  verifyWebhookSignature(
    body: string | Buffer,
    signature: string,
  ): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      this.logger.error(
        `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }
}