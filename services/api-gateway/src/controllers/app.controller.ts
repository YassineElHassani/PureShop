import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  welcome() {
    return {
      message: 'Welcome to PureShop API Gateway',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}