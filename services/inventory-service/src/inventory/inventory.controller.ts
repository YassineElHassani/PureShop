import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InventoryService } from './inventory.service';
import { ReserveStockDto } from './dto/reserve-stock.dto';
import { ReleaseStockDto } from './dto/release-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('stock/:sku')
  async getStockBySku(@Param('sku') sku: string) {
    return this.inventoryService.getStockBySku(sku);
  }

  @Post('stock/reserve')
  async reserveStock(@Body() reserveDto: ReserveStockDto) {
    return this.inventoryService.reserveStock(reserveDto);
  }

  @Post('stock/release')
  async releaseStock(@Body() releaseDto: ReleaseStockDto) {
    return this.inventoryService.releaseStock(releaseDto);
  }

  @Put('stock/:sku')
  async updateStock(
    @Param('sku') sku: string,
    @Body() updateDto: UpdateStockDto,
  ) {
    return this.inventoryService.updateStock(sku, updateDto);
  }

  @Get('stock')
  async getAllStock() {
    return this.inventoryService.getAllStock();
  }

  @Get('out-of-stock')
  async getOutOfStockProducts() {
    return this.inventoryService.getOutOfStockProducts();
  }

  @Get('low-stock')
  async getLowStockProducts(@Query('threshold') threshold?: number) {
    return this.inventoryService.getLowStockProducts(threshold);
  }

  @Get('movements/:sku')
  async getStockMovements(@Param('sku') sku: string) {
    return this.inventoryService.getStockMovements(sku);
  }

  // Microservice message patterns
  @MessagePattern({ cmd: 'get_stock' })
  async handleGetStock(@Payload() data: { sku: string }) {
    return this.inventoryService.getStockBySku(data.sku);
  }

  @MessagePattern({ cmd: 'reserve_stock' })
  async handleReserveStock(@Payload() data: ReserveStockDto) {
    return this.inventoryService.reserveStock(data);
  }

  @MessagePattern({ cmd: 'release_stock' })
  async handleReleaseStock(@Payload() data: ReleaseStockDto) {
    return this.inventoryService.releaseStock(data);
  }

  @MessagePattern({ cmd: 'update_stock' })
  async handleUpdateStock(@Payload() data: any) {
    const { sku, ...updateData } = data;
    return this.inventoryService.updateStock(sku, updateData);
  }

  @MessagePattern({ cmd: 'get_out_of_stock' })
  async handleGetOutOfStock() {
    return this.inventoryService.getOutOfStockProducts();
  }

  @MessagePattern({ cmd: 'get_all_stock' })
  async handleGetAllStock() {
    return this.inventoryService.getAllStock();
  }
}