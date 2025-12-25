import { ClientProviderOptions, Transport } from '@nestjs/microservices';

export const microservicesConfig = (): ClientProviderOptions[] => [
  {
    name: 'AUTH_SERVICE',
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'auth_service_queue',
      queueOptions: {
        durable: true,
      },
      prefetchCount: 1,
    },
  },
  {
    name: 'CATALOG_SERVICE',
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'catalog_service_queue',
      queueOptions: {
        durable: true,
      },
      prefetchCount: 1,
    },
  },
  {
    name: 'INVENTORY_SERVICE',
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'inventory_service_queue',
      queueOptions: {
        durable: true,
      },
      prefetchCount: 1,
    },
  },
  {
    name: 'ORDER_SERVICE',
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'order_service_queue',
      queueOptions: {
        durable: true,
      },
      prefetchCount: 1,
    },
  },
];