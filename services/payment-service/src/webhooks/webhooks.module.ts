import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
    imports: [
        PaymentsModule,
        ClientsModule.register([
            {
                name: 'RABBITMQ_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [
                        process.env.RABBITMQ_URL ||
                        'amqp://guest:guest@localhost:5672',
                    ],
                    queue: 'webhook_queue',
                    queueOptions: { durable: true },
                    prefetch: 1,
                },
            },
        ]),
    ],
    controllers: [WebhooksController],
    providers: [WebhooksService],
    exports: [WebhooksService],
})
export class WebhooksModule { }