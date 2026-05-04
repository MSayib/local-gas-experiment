/**
 * GetProductsUseCase — Unit Test.
 *
 * Tests the use case in complete isolation using a mock ProductPort.
 * LSP: MockProductPort substitutes the real gateway perfectly.
 */

import { GetProductsUseCase } from '@application/use-cases/warehouse/GetProductsUseCase';
import type { ProductPort, CreateProductInput } from '@application/ports/ProductPort';
import { Product } from '@domain/entities/Product';
import { Money } from '@domain/entities/common/ValueObjects';

class MockProductPort implements ProductPort {
  private products: Product[] = [];

  constructor(initialProducts: Product[] = []) {
    this.products = initialProducts;
  }

  async findAll(): Promise<Product[]> {
    return this.products;
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.find(p => p.id === id) || null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.products.find(p => p.sku === sku) || null;
  }

  async create(input: CreateProductInput): Promise<Product> {
    const product = new Product({
      id: String(this.products.length + 1),
      sku: input.sku,
      name: input.name,
      price: Money.create(input.price),
      unit: input.unit,
      stock: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.products.push(product);
    return product;
  }

  async update(id: string, input: Partial<CreateProductInput>): Promise<Product> {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Product not found');
    const updated = new Product({
      id: existing.id,
      sku: input.sku ?? existing.sku,
      name: input.name ?? existing.name,
      price: input.price !== undefined ? Money.create(input.price) : existing.price,
      unit: input.unit ?? existing.unit,
      stock: existing.stock,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });
    this.products = this.products.map(p => p.id === id ? updated : p);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.products = this.products.filter(p => p.id !== id);
  }
}

function createTestProduct(overrides: Partial<{
  id: string; sku: string; name: string; price: number; unit: string; stock: number;
}> = {}): Product {
  return new Product({
    id: overrides.id ?? '1',
    sku: overrides.sku ?? 'SKU-001',
    name: overrides.name ?? 'Test Product',
    price: Money.create(overrides.price ?? 10000),
    unit: overrides.unit ?? 'pcs',
    stock: overrides.stock ?? 50,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });
}

describe('GetProductsUseCase', () => {
  it('should return all products', async () => {
    const products = [
      createTestProduct({ id: '1', sku: 'SKU-001', name: 'Widget A' }),
      createTestProduct({ id: '2', sku: 'SKU-002', name: 'Widget B' }),
    ];

    const port = new MockProductPort(products);
    const useCase = new GetProductsUseCase(port);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Widget A');
    expect(result[1].name).toBe('Widget B');
  });

  it('should return empty array when no products exist', async () => {
    const port = new MockProductPort([]);
    const useCase = new GetProductsUseCase(port);

    const result = await useCase.execute();

    expect(result).toHaveLength(0);
  });
});

describe('Product Entity', () => {
  it('should calculate stock value', () => {
    const product = createTestProduct({ price: 15000, stock: 20 });

    expect(product.stockValue.amount).toBe(300000);
  });

  it('should detect low stock', () => {
    const lowStock = createTestProduct({ stock: 5 });
    const normalStock = createTestProduct({ stock: 50 });

    expect(lowStock.isLowStock()).toBe(true);
    expect(normalStock.isLowStock()).toBe(false);
  });

  it('should create new instance with updated stock', () => {
    const original = createTestProduct({ stock: 50 });
    const updated = original.withStock(30);

    expect(original.stock).toBe(50); // immutable
    expect(updated.stock).toBe(30);
    expect(updated.sku).toBe(original.sku); // other props preserved
  });

  it('should throw on empty SKU', () => {
    expect(() => createTestProduct({ sku: '' })).toThrow('SKU cannot be empty');
  });

  it('should throw on negative stock', () => {
    expect(() => createTestProduct({ stock: -1 })).toThrow('stock cannot be negative');
  });

  it('should serialize to JSON', () => {
    const product = createTestProduct();
    const json = product.toJSON();

    expect(json.sku).toBe('SKU-001');
    expect(json.price).toBe(10000);
    expect(typeof json.createdAt).toBe('string');
  });
});

describe('Money Value Object', () => {
  it('should create valid money', () => {
    const money = Money.create(10000);
    expect(money.amount).toBe(10000);
  });

  it('should throw on negative amount', () => {
    expect(() => Money.create(-100)).toThrow('negative');
  });

  it('should add money', () => {
    const a = Money.create(100);
    const b = Money.create(250);
    expect(a.add(b).amount).toBe(350);
  });

  it('should multiply money', () => {
    const price = Money.create(15000);
    expect(price.multiply(3).amount).toBe(45000);
  });
});
