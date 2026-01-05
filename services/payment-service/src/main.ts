import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import * as express from 'express';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    const app = await NestFactory.create(AppModule);

    // Middleware to capture raw body for webhook signature verification
    app.use(express.json({ verify: storeRawBody }));

    // Microservice setup
    const microserviceOptions: MicroserviceOptions = {
        transport: Transport.RMQ,
        options: {
            urls: [
                process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
            ],
            queue: 'payment_queue',
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

    const port = process.env.PORT || 3005;

    await app.startAllMicroservices();
    await app.listen(port);

    logger.log(`🚀 Payment Service is running on http://localhost:${port}`);
    logger.log(`📨 Listening to RabbitMQ queue: payment_queue`);
    logger.log(`🔐 Webhook endpoint: http://localhost:${port}/webhooks/stripe`);
}

// Helper function to store raw body for webhook signature verification
function storeRawBody(
    req: express.Request,
    res: express.Response,
    buf: Buffer,
    encoding: string,
) {
    if (buf && buf.length) {
        (req as any).rawBody = buf.toString(encoding || 'utf8');
    }
}

bootstrap();