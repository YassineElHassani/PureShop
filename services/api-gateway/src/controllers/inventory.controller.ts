import {
  Controller,
  Get,
  Body,
  Param,
  UseFilters,
  Inject,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { UpdateStockDto } from '../dto/update-stock.dto';

@ApiTags('Inventory')
@Controller('inventory')
@UseFilters(HttpExceptionFilter)
export class InventoryController {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ClientProxy,
  ) {}

  @Get('stock/:sku')
  @ApiOperation({ summary: 'Get stock information by SKU' })
  @ApiParam({ name: 'sku', description: 'Stock Keeping Unit', example: 'WH-2024-001' })
  @ApiResponse({ status: 200, description: 'Stock information retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Stock not found for this SKU' })
  async getStockBySku(@Param('sku') sku: string) {
    return firstValueFrom(
      this.inventoryClient.send({ cmd: 'get_stock' }, { sku }).pipe(timeout(5000)),
    );
  }

  @Put('stock/:sku')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update stock quantity (Admin only)' })
  @ApiParam({ name: 'sku', description: 'Stock Keeping Unit', example: 'WH-2024-001' })
  @ApiResponse({ status: 200, description: 'Stock updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Stock not found for this SKU' })
  async updateStock(@Param('sku') sku: string, @Body() updateStockDto: UpdateStockDto) {
    return firstValueFrom(
      this.inventoryClient.send({ cmd: 'update_stock' }, { sku, ...updateStockDto }).pipe(timeout(5000)),
    );
  }

  @Get('out-of-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all out-of-stock products (Admin only)' })
  @ApiResponse({ status: 200, description: 'Out-of-stock products retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getOutOfStockProducts() {
    return firstValueFrom(
      this.inventoryClient.send({ cmd: 'get_out_of_stock' }, {}).pipe(timeout(5000)),
    );
  }
}