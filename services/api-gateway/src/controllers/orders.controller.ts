import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseFilters,
  Inject,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { CreateOrderDto } from '../dto/create-order.dto';

@ApiTags('Orders')
@Controller('orders')
@UseFilters(HttpExceptionFilter)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(
    @Inject('ORDER_SERVICE') private orderClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Insufficient stock' })
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Request() req: any) {
    const userId = req.user?.sub;
    return firstValueFrom(
      this.orderClient.send(
        { cmd: 'create_order' },
        { ...createOrderDto, userId },
      ).pipe(timeout(5000)),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for current user' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getOrders(@Request() req: any) {
    const userId = req.user?.sub;
    return firstValueFrom(
      this.orderClient.send({ cmd: 'get_orders' }, { userId }).pipe(timeout(5000)),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.sub;
    return firstValueFrom(
      this.orderClient.send({ cmd: 'get_order' }, { id, userId }).pipe(timeout(5000)),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 409, description: 'Order cannot be cancelled' })
  async cancelOrder(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.sub;
    return firstValueFrom(
      this.orderClient.send({ cmd: 'cancel_order' }, { id, userId }).pipe(timeout(5000)),
    );
  }
}