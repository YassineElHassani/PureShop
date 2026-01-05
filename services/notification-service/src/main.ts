import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';

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
            queue: 'notification_queue',
            queueOptions: {
                durable: true,
            },
            prefetch: 1,
        },
    };

    app.connectMicroservice(microserviceOptions);

    // Global pipes
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // Global filters
    app.useGlobalFilters(new HttpExceptionFilter());

    // Enable CORS
    app.enableCors({
        origin: '*',
        credentials: true,
    });

    const port = process.env.PORT || 3006;

    await app.startAllMicroservices();
    await app.listen(port);

    logger.log(`🚀 Notification Service is running on http://localhost:${port}`);
    logger.log(
        `📨 WebSocket endpoint: ws://localhost:${port}/${process.env.WEBSOCKET_NAMESPACE || 'notifications'}`,
    );
    logger.log(`📨 Listening to RabbitMQ queue: notification_queue`);
}

bootstrap();