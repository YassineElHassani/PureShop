import {
    Injectable,
    CanActivate,
    ExecutionContext,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from '../config/stripe.config';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
    private readonly logger = new Logger(WebhookSignatureGuard.name);

    constructor(private stripeService: StripeService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const signature = request.headers['stripe-signature'] as string;

        if (!signature) {
            this.logger.warn('Missing Stripe signature in webhook request');
            throw new BadRequestException('Missing Stripe signature');
        }

        try {
            const body = request.rawBody as string | Buffer;
            this.stripeService.verifyWebhookSignature(body, signature);
            return true;
        } catch (error) {
            this.logger.error(
                `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
            throw new BadRequestException('Invalid webhook signature');
        }
    }
}