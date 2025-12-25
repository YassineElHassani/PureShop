import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { AllRpcExceptionFilter } from './filters/rpc-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // Microservice setup
  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [
        process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
      ],
      queue: 'catalog_service_queue',
      queueOptions: {
        durable: true,
      },
      prefetch: 1,
    },
  };

  app.connectMicroservice(microserviceOptions);

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Global RPC exception filter
  app.useGlobalFilters(new AllRpcExceptionFilter());

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const port = process.env.PORT || 3002;

  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(`🚀 Catalog Service is running on http://localhost:${port}`);
  logger.log(`📨 Listening to RabbitMQ queue: catalog_service_queue`);
}

bootstrap();