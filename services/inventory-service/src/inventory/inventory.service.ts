import {
  Injectable,
  Logger,
  Inject,
} from '@nestjs/common';
import { RpcException, ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { ReleaseStockDto } from './dto/release-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('RABBITMQ_SERVICE') private rabbitClient: ClientProxy,
  ) {}

  async getStockBySku(sku: string) {
    try {
      let stock = await this.prisma.stock.findUnique({
        where: { sku },
      });

      if (!stock) {
        // Create stock entry if it doesn't exist
        stock = await this.prisma.stock.create({
          data: {
            sku,
            quantity: 0,
            reserved: 0,
          },
        });
        this.logger.log(`Stock entry created for SKU: ${sku}`);
      }

      return this.formatStockResponse(stock);
    } catch (error) {
      this.logger.error(`Failed to get stock: ${error.message}`);
      throw error;
    }
  }

  async reserveStock(reserveDto: ReserveStockDto) {
    try {
      // Get current stock
      let stock = await this.prisma.stock.findUnique({
        where: { sku: reserveDto.sku },
      });

      if (!stock) {
        throw new RpcException({
          statusCode: 404,
          message: `Stock not found for SKU: ${reserveDto.sku}`,
        });
      }

      const available = stock.quantity - stock.reserved;

      // Check if enough stock available
      if (available < reserveDto.quantity) {
        throw new RpcException({
          statusCode: 409,
          message: `Insufficient stock. Available: ${available}, Requested: ${reserveDto.quantity}`,
        });
      }

      // Update reserved quantity
      stock = await this.prisma.stock.update({
        where: { sku: reserveDto.sku },
        data: {
          reserved: {
            increment: reserveDto.quantity,
          },
        },
      });

      // Record movement
      await this.createStockMovement({
        sku: reserveDto.sku,
        type: 'RESERVED',
        quantity: reserveDto.quantity,
        reason: reserveDto.reason || 'Order created',
        metadata: JSON.stringify({ orderId: reserveDto.orderId }),
      });

      this.logger.log(
        `Stock reserved for SKU ${reserveDto.sku}: ${reserveDto.quantity} units`,
      );

      // Emit event
      this.rabbitClient.emit('inventory.stock.reserved', {
        sku: reserveDto.sku,
        quantity: reserveDto.quantity,
        orderId: reserveDto.orderId,
        timestamp: new Date(),
      });

      return this.formatStockResponse(stock);
    } catch (error) {
      this.logger.error(`Failed to reserve stock: ${error.message}`);
      throw error;
    }
  }

  async releaseStock(releaseDto: ReleaseStockDto) {
    try {
      // Get current stock
      let stock = await this.prisma.stock.findUnique({
        where: { sku: releaseDto.sku },
      });

      if (!stock) {
        throw new RpcException({
          statusCode: 404,
          message: `Stock not found for SKU: ${releaseDto.sku}`,
        });
      }

      // Check if enough reserved stock to release
      if (stock.reserved < releaseDto.quantity) {
        throw new RpcException({
          statusCode: 409,
          message: `Cannot release more than reserved. Reserved: ${stock.reserved}, Requested: ${releaseDto.quantity}`,
        });
      }

      // Update reserved quantity
      stock = await this.prisma.stock.update({
        where: { sku: releaseDto.sku },
        data: {
          reserved: {
            decrement: releaseDto.quantity,
          },
        },
      });

      // Record movement
      await this.createStockMovement({
        sku: releaseDto.sku,
        type: 'RELEASED',
        quantity: releaseDto.quantity,
        reason: releaseDto.reason || 'Order cancelled',
        metadata: JSON.stringify({ orderId: releaseDto.orderId }),
      });

      this.logger.log(
        `Stock released for SKU ${releaseDto.sku}: ${releaseDto.quantity} units`,
      );

      // Emit event
      this.rabbitClient.emit('inventory.stock.released', {
        sku: releaseDto.sku,
        quantity: releaseDto.quantity,
        orderId: releaseDto.orderId,
        timestamp: new Date(),
      });

      return this.formatStockResponse(stock);
    } catch (error) {
      this.logger.error(`Failed to release stock: ${error.message}`);
      throw error;
    }
  }

  async updateStock(sku: string, updateDto: UpdateStockDto) {
    try {
      let stock = await this.prisma.stock.findUnique({
        where: { sku },
      });

      if (!stock) {
        throw new RpcException({
          statusCode: 404,
          message: `Stock not found for SKU: ${sku}`,
        });
      }

      const updateData: any = {};

      if (updateDto.quantity !== undefined) {
        const quantityDifference = updateDto.quantity - stock.quantity;
        updateData.quantity = updateDto.quantity;

        // Record movement
        if (quantityDifference !== 0) {
          await this.createStockMovement({
            sku,
            type: quantityDifference > 0 ? 'INBOUND' : 'OUTBOUND',
            quantity: Math.abs(quantityDifference),
            reason: updateDto.reason || 'Manual adjustment',
            metadata: JSON.stringify({
              oldQuantity: stock.quantity,
              newQuantity: updateDto.quantity,
            }),
          });
        }
      }

      if (updateDto.reserved !== undefined) {
        updateData.reserved = updateDto.reserved;
      }

      stock = await this.prisma.stock.update({
        where: { sku },
        data: updateData,
      });

      this.logger.log(`Stock updated for SKU: ${sku}`);

      return this.formatStockResponse(stock);
    } catch (error) {
      this.logger.error(`Failed to update stock: ${error.message}`);
      throw error;
    }
  }

  async getOutOfStockProducts() {
    try {
      const outOfStockProducts = await this.prisma.stock.findMany({
        where: {
          quantity: {
            lte: 0,
          },
        },
      });

      return outOfStockProducts.map((stock: any) =>
        this.formatStockResponse(stock),
      );
    } catch (error) {
      this.logger.error(`Failed to get out of stock products: ${error.message}`);
      throw error;
    }
  }

  async getLowStockProducts(threshold: number = 10) {
    try {
      const lowStockProducts = await this.prisma.stock.findMany({
        where: {
          quantity: {
            lte: threshold,
            gt: 0,
          },
        },
      });

      return lowStockProducts.map((stock: any) =>
        this.formatStockResponse(stock),
      );
    } catch (error) {
      this.logger.error(`Failed to get low stock products: ${error.message}`);
      throw error;
    }
  }

  async getStockMovements(sku: string) {
    try {
      const movements = await this.prisma.stockMovement.findMany({
        where: { sku },
        orderBy: { createdAt: 'desc' },
      });

      return movements;
    } catch (error) {
      this.logger.error(`Failed to get stock movements: ${error.message}`);
      throw error;
    }
  }

  async getAllStock() {
    try {
      const stocks = await this.prisma.stock.findMany({
        orderBy: { sku: 'asc' },
      });

      return stocks.map((stock: any) => this.formatStockResponse(stock));
    } catch (error) {
      this.logger.error(`Failed to get all stock: ${error.message}`);
      throw error;
    }
  }

  private async createStockMovement(data: any) {
    try {
      await this.prisma.stockMovement.create({
        data,
      });
    } catch (error) {
      this.logger.error(`Failed to create stock movement: ${error.message}`);
    }
  }

  private formatStockResponse(stock: any) {
    return {
      id: stock.id,
      sku: stock.sku,
      quantity: stock.quantity,
      reserved: stock.reserved,
      available: stock.quantity - stock.reserved,
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt,
    };
  }
}