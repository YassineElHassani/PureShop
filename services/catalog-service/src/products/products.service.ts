import {
  Injectable,
  Logger,
  Inject,
} from '@nestjs/common';
import { RpcException, ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('RABBITMQ_SERVICE') private rabbitClient: ClientProxy,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      // Check if SKU already exists
      const existingSku = await this.prisma.product.findUnique({
        where: { sku: createProductDto.sku },
      });

      if (existingSku) {
        throw new RpcException({
          statusCode: 400,
          message: 'SKU already exists',
        });
      }

      const product = await this.prisma.product.create({
        data: {
          ...createProductDto,
        },
      });

      // Emit event
      this.rabbitClient.emit('catalog.product.created', {
        id: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        createdAt: product.createdAt,
      });

      this.logger.log(`Product created: ${product.sku}`);
      return product;
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`);
      throw error;
    }
  }

  async findAll(filterDto: FilterProductDto) {
    try {
      const { page = 1, limit = 10, category, search, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = filterDto;

      const skip = (page - 1) * limit;

      const where: any = {
        isActive: true,
      };

      if (category) {
        where.category = {
          contains: category,
          mode: 'insensitive',
        };
      }

      if (search) {
        where.OR = [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            sku: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ];
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) {
          where.price.gte = minPrice;
        }
        if (maxPrice !== undefined) {
          where.price.lte = maxPrice;
        }
      }

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
        }),
        this.prisma.product.count({ where }),
      ]);

      return {
        data: products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to fetch products: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        throw new RpcException({
          statusCode: 404,
          message: 'Product not found',
        });
      }

      return product;
    } catch (error) {
      this.logger.error(`Failed to find product: ${error.message}`);
      throw error;
    }
  }

  async findBySku(sku: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { sku },
      });

      if (!product) {
        throw new RpcException({
          statusCode: 404,
          message: 'Product not found',
        });
      }

      return product;
    } catch (error) {
      this.logger.error(`Failed to find product by SKU: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
      });

      // Emit event
      this.rabbitClient.emit('catalog.product.updated', {
        id: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        updatedAt: product.updatedAt,
      });

      this.logger.log(`Product updated: ${product.sku}`);
      return product;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new RpcException({
          statusCode: 404,
          message: 'Product not found',
        });
      }
      this.logger.error(`Failed to update product: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.product.delete({
        where: { id },
      });

      this.logger.log(`Product deleted: ${id}`);
      return { message: 'Product deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new RpcException({
          statusCode: 404,
          message: 'Product not found',
        });
      }
      this.logger.error(`Failed to delete product: ${error.message}`);
      throw error;
    }
  }

  async getProductsByCategory(category: string) {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          category: {
            contains: category,
            mode: 'insensitive',
          },
          isActive: true,
        },
      });

      return products;
    } catch (error) {
      this.logger.error(`Failed to get products by category: ${error.message}`);
      throw error;
    }
  }

  async deactivate(id: string) {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: { isActive: false },
      });

      this.logger.log(`Product deactivated: ${product.sku}`);
      return product;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new RpcException({
          statusCode: 404,
          message: 'Product not found',
        });
      }
      this.logger.error(`Failed to deactivate product: ${error.message}`);
      throw error;
    }
  }
}