import { NestFactory } from '@nestjs/core';
import { OrdersServiceModule } from './orders-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrdersServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'orders_queue',
        queueOptions: { 
          durable: false,
        },
      },
    }
  );

  await app.listen();
  console.log('Orders Service is listening on RabbitMQ');
}
bootstrap();

