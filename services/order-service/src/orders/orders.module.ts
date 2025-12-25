import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { InventoryEventsListener } from './listeners/inventory-events.listener';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'RABBITMQ_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [
                        process.env.RABBITMQ_URL ||
                        'amqp://guest:guest@localhost:5672',
                    ],
                    queue: 'order_queue',
                    queueOptions: { durable: true },
                    prefetch: 1,
                },
            },
        ]),
    ],
    controllers: [OrdersController],
    providers: [OrdersService, InventoryEventsListener],
    exports: [OrdersService],
})
export class OrdersModule { }