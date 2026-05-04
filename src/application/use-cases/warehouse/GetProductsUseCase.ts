/**
 * GetProductsUseCase — Application Business Rule.
 *
 * Retrieves all products from the data source.
 * Depends on ProductPort (abstraction), NOT on concrete database.
 *
 * DIP: High-level module depends on abstraction.
 * SRP: Only responsible for retrieving products.
 */

import type { Product } from '@domain/entities/Product';
import type { ProductPort } from '@application/ports/ProductPort';

export class GetProductsUseCase {
  constructor(private readonly productPort: ProductPort) {}

  async execute(): Promise<Product[]> {
    return this.productPort.findAll();
  }
}
