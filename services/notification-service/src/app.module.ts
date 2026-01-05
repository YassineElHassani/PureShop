import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsModule } from './websockets/notifications.module';
import { EmailModule } from './email/email.module';
import { PaymentEventsListener } from './listeners/payment-events.listener';
import { OrderEventsListener } from './listeners/order-events.listener';
import { InventoryEventsListener } from './listeners/inventory-events.listener';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { HealthController } from './health.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        ClientsModule.register([
            {
                name: 'RABBITMQ_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [
                        process.env.RABBITMQ_URL ||
                        'amqp://guest:guest@localhost:5672',
                    ],
                    queue: 'notification_queue',
                    queueOptions: { durable: true },
                    prefetch: 1,
                },
            },
        ]),
        NotificationsModule,
        EmailModule,
    ],
    controllers: [HealthController],
    providers: [
        PaymentEventsListener,
        OrderEventsListener,
        InventoryEventsListener,
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor,
        },
    ],
})
export class AppModule { }