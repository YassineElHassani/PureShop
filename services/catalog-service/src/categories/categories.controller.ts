import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { CacheInterceptor } from '../products/interceptors/cache.interceptor';

@Controller('categories')
@UseFilters(HttpExceptionFilter)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() data: { name: string; slug: string }) {
    return this.categoriesService.create(data);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  async findById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.categoriesService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }

  // Microservice message pattern
  @MessagePattern({ cmd: 'get_categories' })
  async handleGetCategories() {
    return this.categoriesService.findAll();
  }
}