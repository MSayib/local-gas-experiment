/**
 * ProductPort — Interface for Product data access.
 *
 * Defines the contract for CRUD operations on Products.
 * Use Cases depend on this abstraction.
 */

import type { Product } from '@domain/entities/Product';

export interface CreateProductInput {
  readonly sku: string;
  readonly name: string;
  readonly price: number;
  readonly unit: string;
}

export interface ProductPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  create(input: CreateProductInput): Promise<Product>;
  update(id: string, input: Partial<CreateProductInput>): Promise<Product>;
  delete(id: string): Promise<void>;
}
