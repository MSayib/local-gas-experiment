/**
 * Product Entity — Enterprise Business Rule.
 *
 * Represents a product in the warehouse system.
 * Zero dependencies on external frameworks or GAS APIs.
 *
 * SRP: Only responsible for product invariants and business rules.
 */

import { Money } from './common/ValueObjects';

export interface ProductProps {
  readonly id: string;
  readonly sku: string;
  readonly name: string;
  readonly price: Money;
  readonly unit: string;
  readonly stock: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class Product {
  private readonly props: ProductProps;

  constructor(props: ProductProps) {
    this.validate(props);
    this.props = Object.freeze({ ...props });
  }

  private validate(props: ProductProps): void {
    if (!props.sku.trim()) throw new Error('Product SKU cannot be empty');
    if (!props.name.trim()) throw new Error('Product name cannot be empty');
    if (!props.unit.trim()) throw new Error('Product unit cannot be empty');
    if (props.stock < 0) throw new Error('Product stock cannot be negative');
  }

  get id(): string { return this.props.id; }
  get sku(): string { return this.props.sku; }
  get name(): string { return this.props.name; }
  get price(): Money { return this.props.price; }
  get unit(): string { return this.props.unit; }
  get stock(): number { return this.props.stock; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  get stockValue(): Money {
    return this.props.price.multiply(this.props.stock);
  }

  isLowStock(threshold: number = 10): boolean {
    return this.props.stock <= threshold;
  }

  /**
   * Create a new Product instance with updated stock.
   * Entities are immutable — returns a new instance.
   */
  withStock(newStock: number): Product {
    return new Product({
      ...this.props,
      stock: newStock,
      updatedAt: new Date(),
    });
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      sku: this.sku,
      name: this.name,
      price: this.price.amount,
      unit: this.unit,
      stock: this.stock,
      stockValue: this.stockValue.amount,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
