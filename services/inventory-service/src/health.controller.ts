import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'UP',
      service: 'Inventory Service',
      timestamp: new Date().toISOString(),
    };
  }
}