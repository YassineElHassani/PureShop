import {
  Injectable,
  Logger,
  Inject,
} from '@nestjs/common';
import { RpcException, ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly taxRate = parseFloat(process.env.TAX_RATE || '0.1');
  private readonly catalogServiceUrl = process.env.CATALOG_SERVICE_URL || 'http://localhost:3002';
  private readonly inventoryServiceUrl = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003';

  constructor(
    private prisma: PrismaService,
    @Inject('RABBITMQ_SERVICE') private rabbitClient: ClientProxy,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    try {
      // Validate and fetch product details
      const orderItems = [];
      let subtotal = 0;

      for (const item of createOrderDto.items) {
        try {
          const productResponse = await axios.get(
            `${this.catalogServiceUrl}/products/category/${item.sku}`,
            { timeout: 5000 },
          );

          let product = productResponse.data?.data;

          // If not found by category, try by ID
          if (!product || !Array.isArray(product) || product.length === 0) {
            const productDetailResponse = await axios.get(
              `${this.catalogServiceUrl}/products`,
              {
                params: { search: item.sku },
                timeout: 5000,
              },
            );

            const products = productDetailResponse.data?.data;
            product = products?.find((p: any) => p.sku === item.sku);
          }

          if (!product) {
            throw new RpcException({
              statusCode: 404,
              message: `Product with SKU ${item.sku} not found`,
            });
          }

          const itemTotal = product.price * item.quantity;
          subtotal += itemTotal;

          orderItems.push({
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: product.price,
            total: itemTotal,
          });
        } catch (error) {
          this.logger.error(
            `Failed to fetch product ${item.sku}: ${error.message}`,
          );
          throw new RpcException({
            statusCode: 400,
            message: `Product ${item.sku} not found or unavailable`,
          });
        }
      }

      // Calculate tax and total
      const tax = parseFloat((subtotal * this.taxRate).toFixed(2));
      const totalPrice = parseFloat((subtotal + tax).toFixed(2));
      subtotal = parseFloat(subtotal.toFixed(2));

      // Create order
      const order = await this.prisma.order.create({
        data: {
          userId,
          status: 'PENDING',
          subtotal,
          tax,
          totalPrice,
          items: {
            createMany: {
              data: orderItems,
            },
          },
        },
        include: {
          items: true,
        },
      });

      this.logger.log(`Order created: ${order.id}`);

      // Emit order created event to trigger inventory reservation
      this.rabbitClient.emit('order.created', {
        orderId: order.id,
        userId: order.userId,
        items: orderItems.map((item) => ({
          sku: item.sku,
          quantity: item.quantity,
        })),
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
      });

      return this.formatOrderResponse(order);
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`);
      throw error;
    }
  }

  async getOrders(userId: string) {
    try {
      const orders = await this.prisma.order.findMany({
        where: { userId },
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return orders.map((order: any) => this.formatOrderResponse(order));
    } catch (error) {
      this.logger.error(`Failed to get orders: ${error.message}`);
      throw error;
    }
  }

  async getOrderById(orderId: string, userId: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new RpcException({
          statusCode: 404,
          message: 'Order not found',
        });
      }

      // Check ownership
      if (order.userId !== userId) {
        throw new RpcException({
          statusCode: 400,
          message: 'Unauthorized to access this order',
        });
      }

      return this.formatOrderResponse(order);
    } catch (error) {
      this.logger.error(`Failed to get order: ${error.message}`);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, updateDto: UpdateOrderStatusDto) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new RpcException({
          statusCode: 404,
          message: 'Order not found',
        });
      }

      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: updateDto.status as any,
        },
        include: {
          items: true,
        },
      });

      this.logger.log(`Order status updated: ${orderId} → ${updateDto.status}`);

      // Emit event based on status
      if (updateDto.status === 'PAID') {
        this.rabbitClient.emit('order.paid', {
          orderId: updatedOrder.id,
          userId: updatedOrder.userId,
          totalPrice: updatedOrder.totalPrice,
        });
      } else if (updateDto.status === 'CANCELLED') {
        this.rabbitClient.emit('order.cancelled', {
          orderId: updatedOrder.id,
          userId: updatedOrder.userId,
          items: updatedOrder.items.map((item: any) => ({
            sku: item.sku,
            quantity: item.quantity,
          })),
        });
      }

      return this.formatOrderResponse(updatedOrder);
    } catch (error) {
      this.logger.error(`Failed to update order status: ${error.message}`);
      throw error;
    }
  }

  async cancelOrder(orderId: string, userId: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new RpcException({
          statusCode: 404,
          message: 'Order not found',
        });
      }

      // Check ownership
      if (order.userId !== userId) {
        throw new RpcException({
          statusCode: 400,
          message: 'Unauthorized to cancel this order',
        });
      }

      // Check if already cancelled
      if (order.status === 'CANCELLED') {
        throw new RpcException({
          statusCode: 400,
          message: 'Order is already cancelled',
        });
      }

      // Update status to CANCELLED
      const cancelledOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
        },
        include: {
          items: true,
        },
      });

      this.logger.log(`Order cancelled: ${orderId}`);

      // Emit order cancelled event to release inventory
      this.rabbitClient.emit('order.cancelled', {
        orderId: cancelledOrder.id,
        userId: cancelledOrder.userId,
        items: cancelledOrder.items.map((item: any) => ({
          sku: item.sku,
          quantity: item.quantity,
        })),
      });

      return this.formatOrderResponse(cancelledOrder);
    } catch (error) {
      this.logger.error(`Failed to cancel order: ${error.message}`);
      throw error;
    }
  }

  async getAllOrders(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          include: { items: true },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.order.count(),
      ]);

      return {
        data: orders.map((order: any) => this.formatOrderResponse(order)),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get all orders: ${error.message}`);
      throw error;
    }
  }

  async getOrdersByStatus(status: string) {
    try {
      const orders = await this.prisma.order.findMany({
        where: { status: status as any },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });

      return orders.map((order: any) => this.formatOrderResponse(order));
    } catch (error) {
      this.logger.error(`Failed to get orders by status: ${error.message}`);
      throw error;
    }
  }

  private formatOrderResponse(order: any) {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      totalPrice: order.totalPrice,
      items: order.items.map((item: any) => ({
        id: item.id,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}