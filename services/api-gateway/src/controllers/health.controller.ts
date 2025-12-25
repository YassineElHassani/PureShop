import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('CATALOG_SERVICE') private catalogClient: ClientProxy,
    @Inject('INVENTORY_SERVICE') private inventoryClient: ClientProxy,
    @Inject('ORDER_SERVICE') private orderClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'API Gateway',
      version: '1.0.0',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  async readiness() {
    // Check if microservices are connected
    const services = [
      { name: 'auth', client: this.authClient },
      { name: 'catalog', client: this.catalogClient },
      { name: 'inventory', client: this.inventoryClient },
      { name: 'order', client: this.orderClient },
    ];

    const serviceStatuses = await Promise.all(
      services.map(async (service) => {
        try {
          // Check if client is connected
          const connected = service.client ? true : false;
          return { name: service.name, status: connected ? 'UP' : 'DOWN' };
        } catch (error) {
          return { name: service.name, status: 'DOWN' };
        }
      }),
    );

    return {
      status: 'READY',
      timestamp: new Date().toISOString(),
      services: serviceStatuses,
    };
  }
}