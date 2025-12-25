import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto } from '../dto/create-order.dto';

@Injectable()
export class ValidateOrderPipe implements PipeTransform {
  transform(value: CreateOrderDto, metadata: ArgumentMetadata) {
    // Validate that items array is not empty
    if (!value.items || value.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Validate that all SKUs are unique
    const skus = value.items.map((item) => item.sku);
    const uniqueSkus = new Set(skus);
    if (uniqueSkus.size !== skus.length) {
      throw new BadRequestException('Order contains duplicate SKUs');
    }

    // Validate quantities
    for (const item of value.items) {
      if (item.quantity <= 0) {
        throw new BadRequestException(
          `Invalid quantity for SKU ${item.sku}: must be greater than 0`,
        );
      }
      if (!Number.isInteger(item.quantity)) {
        throw new BadRequestException(
          `Invalid quantity for SKU ${item.sku}: must be an integer`,
        );
      }
    }

    return value;
  }
}