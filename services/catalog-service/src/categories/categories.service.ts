import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; slug: string }) {
    try {
      const existingCategory = await this.prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (existingCategory) {
        throw new RpcException({
          statusCode: 400,
          message: 'Category already exists',
        });
      }

      const category = await this.prisma.category.create({
        data,
      });

      this.logger.log(`Category created: ${category.name}`);
      return category;
    } catch (error) {
      this.logger.error(`Failed to create category: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch categories: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new RpcException({
          statusCode: 404,
          message: 'Category not found',
        });
      }

      return category;
    } catch (error) {
      this.logger.error(`Failed to find category: ${error.message}`);
      throw error;
    }
  }

  async findBySlug(slug: string) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { slug },
      });

      if (!category) {
        throw new RpcException({
          statusCode: 404,
          message: 'Category not found',
        });
      }

      return category;
    } catch (error) {
      this.logger.error(`Failed to find category by slug: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const category = await this.prisma.category.update({
        where: { id },
        data,
      });

      this.logger.log(`Category updated: ${category.name}`);
      return category;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new RpcException({
          statusCode: 404,
          message: 'Category not found',
        });
      }
      this.logger.error(`Failed to update category: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.category.delete({
        where: { id },
      });

      this.logger.log(`Category deleted: ${id}`);
      return { message: 'Category deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new RpcException({
          statusCode: 404,
          message: 'Category not found',
        });
      }
      this.logger.error(`Failed to delete category: ${error.message}`);
      throw error;
    }
  }
}