import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseFilters,
  UseInterceptors,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { CacheInterceptor } from './interceptors/cache.interceptor';

@Controller('products')
@UseFilters(HttpExceptionFilter)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  async findAll(@Query() filterDto: FilterProductDto) {
    return this.productsService.findAll(filterDto);
  }

  @Get('category/:category')
  @UseInterceptors(CacheInterceptor)
  async getByCategory(@Param('category') category: string) {
    return this.productsService.getProductsByCategory(category);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  async findById(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @Put(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.productsService.deactivate(id);
  }

  // Microservice message patterns
  @MessagePattern({ cmd: 'get_products' })
  async handleGetProducts(data: any) {
    return this.productsService.findAll(data);
  }

  @MessagePattern({ cmd: 'get_product' })
  async handleGetProduct(data: { id: string }) {
    return this.productsService.findById(data.id);
  }

  @MessagePattern({ cmd: 'create_product' })
  async handleCreateProduct(data: CreateProductDto) {
    return this.productsService.create(data);
  }

  @MessagePattern({ cmd: 'update_product' })
  async handleUpdateProduct(data: any) {
    const { id, ...updateData } = data;
    return this.productsService.update(id, updateData);
  }

  @MessagePattern({ cmd: 'delete_product' })
  async handleDeleteProduct(data: { id: string }) {
    return this.productsService.delete(data.id);
  }
}