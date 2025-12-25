import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'UP',
      service: 'Catalog Service',
      timestamp: new Date().toISOString(),
    };
  }
}