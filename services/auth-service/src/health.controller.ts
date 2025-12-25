import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'UP',
      service: 'Auth Service',
      timestamp: new Date().toISOString(),
    };
  }
}