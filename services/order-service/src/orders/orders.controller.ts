import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ValidateOrderPipe } from './pipes/validate-order.pipe';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async createOrder(
    @Body(ValidateOrderPipe) createOrderDto: CreateOrderDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || req.user?.id || 'unknown';
    return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Get()
  async getOrders(@Request() req: any) {
    const userId = req.user?.sub || req.user?.id || 'unknown';
    return this.ordersService.getOrders(userId);
  }

  @Get('all')
  async getAllOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.ordersService.getAllOrders(page, limit);
  }

  @Get('status/:status')
  async getOrdersByStatus(@Param('status') status: string) {
    return this.ordersService.getOrdersByStatus(status);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.sub || req.user?.id || 'unknown';
    return this.ordersService.getOrderById(id, userId);
  }

  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, updateDto);
  }

  @Delete(':id')
  async cancelOrder(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.sub || req.user?.id || 'unknown';
    return this.ordersService.cancelOrder(id, userId);
  }

  // Microservice message patterns
  @MessagePattern({ cmd: 'create_order' })
  async handleCreateOrder(@Payload() data: any) {
    const { userId, ...createOrderData } = data;
    return this.ordersService.createOrder(userId, createOrderData);
  }

  @MessagePattern({ cmd: 'get_orders' })
  async handleGetOrders(@Payload() data: any) {
    return this.ordersService.getOrders(data.userId);
  }

  @MessagePattern({ cmd: 'get_order' })
  async handleGetOrder(@Payload() data: any) {
    return this.ordersService.getOrderById(data.id, data.userId);
  }

  @MessagePattern({ cmd: 'update_order_status' })
  async handleUpdateOrderStatus(@Payload() data: any) {
    const { id, ...updateData } = data;
    return this.ordersService.updateOrderStatus(id, updateData);
  }

  @MessagePattern({ cmd: 'cancel_order' })
  async handleCancelOrder(@Payload() data: any) {
    return this.ordersService.cancelOrder(data.id, data.userId);
  }
}