import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { OrderEventsListener } from './listeners/order-events.listener';

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
          queue: 'inventory_queue',
          queueOptions: { durable: true },
          prefetch: 1,
        },
      },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, OrderEventsListener],
  exports: [InventoryService],
})
export class InventoryModule {}