import { Controller, Get, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'UP',
      service: 'Auth Service',
      timestamp: new Date().toISOString()
    };
  }

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() registerDto: RegisterDto) {
    this.logger.log('Received register request');
    return this.authService.register(registerDto);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() loginDto: LoginDto) {
    this.logger.log('Received login request');
    return this.authService.login(loginDto);
  }

  @MessagePattern({ cmd: 'get_profile' })
  async getProfile(@Payload() data: { userId: string }) {
    this.logger.log(`Received get_profile request for user: ${data.userId}`);
    return this.authService.getProfile(data.userId);
  }

  @MessagePattern({ cmd: 'verify_token' })
  async verifyToken(@Payload() data: { token: string }) {
    this.logger.log('Received verify_token request');
    return this.authService.verifyToken(data.token);
  }

  @MessagePattern({ cmd: 'logout' })
  async logout(@Payload() data: { userId: string }) {
    this.logger.log(`Received logout request for user: ${data.userId}`);
    return this.authService.logout(data.userId);
  }
}
