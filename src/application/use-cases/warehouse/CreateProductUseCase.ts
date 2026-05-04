/**
 * CreateProductUseCase — Create a new product in the warehouse.
 */

import type { Product } from '@domain/entities/Product';
import type { ProductPort, CreateProductInput } from '@application/ports/ProductPort';

export class CreateProductUseCase {
  constructor(private readonly productPort: ProductPort) {}

  async execute(input: CreateProductInput): Promise<Product> {
    // Business rule: SKU must be unique
    const existing = await this.productPort.findBySku(input.sku);
    if (existing) {
      throw new Error(`Product with SKU "${input.sku}" already exists`);
    }

    return this.productPort.create(input);
  }
}
