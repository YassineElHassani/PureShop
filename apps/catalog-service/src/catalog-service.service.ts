import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogServiceService {
  getHello(): string {
    return 'Catalog Service is running';
  }
}
