import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('get_user')
  async getUser(@Payload() data: { id: string }) {
    this.logger.log(`Getting user with id: ${data.id}`);
    return await this.usersService.findById(data.id);
  }

  @MessagePattern('get_all_users')
  async getAllUsers() {
    this.logger.log('Getting all users');
    return await this.usersService.findAll();
  }

  @MessagePattern('update_user')
  async updateUser(@Payload() data: { id: string; updateData: any }) {
    this.logger.log(`Updating user with id: ${data.id}`);
    return await this.usersService.update(data.id, data.updateData);
  }

  @MessagePattern('delete_user')
  async deleteUser(@Payload() data: { id: string }) {
    this.logger.log(`Deleting user with id: ${data.id}`);
    return await this.usersService.delete(data.id);
  }
}
