/**
 * SqlProductRepository — Implements ProductPort using raw SQL.
 *
 * Same SQL runs on both pg (local) and Jdbc (GAS production).
 * Depends on DatabasePort abstraction, NOT on specific drivers.
 */

import type { DatabasePort } from '@application/ports/DatabasePort';
import type { ProductPort, CreateProductInput } from '@application/ports/ProductPort';
import { Product } from '@domain/entities/Product';
import { Money } from '@domain/entities/common/ValueObjects';

export class SqlProductRepository implements ProductPort {
  constructor(private readonly db: DatabasePort) {}

  async findAll(): Promise<Product[]> {
    const result = await this.db.query(
      'SELECT id, sku, name, price, unit, stock, created_at, updated_at FROM products ORDER BY created_at DESC'
    );
    return result.rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Product | null> {
    const result = await this.db.query(
      'SELECT id, sku, name, price, unit, stock, created_at, updated_at FROM products WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? this.toDomain(result.rows[0]) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const result = await this.db.query(
      'SELECT id, sku, name, price, unit, stock, created_at, updated_at FROM products WHERE sku = $1',
      [sku]
    );
    return result.rows.length > 0 ? this.toDomain(result.rows[0]) : null;
  }

  async create(input: CreateProductInput): Promise<Product> {
    const result = await this.db.query(
      `INSERT INTO products (sku, name, price, unit, stock)
       VALUES ($1, $2, $3, $4, 0)
       RETURNING id, sku, name, price, unit, stock, created_at, updated_at`,
      [input.sku, input.name, input.price, input.unit]
    );
    return this.toDomain(result.rows[0]);
  }

  async update(id: string, input: Partial<CreateProductInput>): Promise<Product> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.sku !== undefined) {
      fields.push(`sku = $${paramIndex++}`);
      values.push(input.sku);
    }
    if (input.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.price !== undefined) {
      fields.push(`price = $${paramIndex++}`);
      values.push(input.price);
    }
    if (input.unit !== undefined) {
      fields.push(`unit = $${paramIndex++}`);
      values.push(input.unit);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.db.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, sku, name, price, unit, stock, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error(`Product with id "${id}" not found`);
    }
    return this.toDomain(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const result = await this.db.execute(
      'DELETE FROM products WHERE id = $1',
      [id]
    );
    if (result.rowCount === 0) {
      throw new Error(`Product with id "${id}" not found`);
    }
  }

  /**
   * Update stock after a stock movement.
   * Uses atomic SQL to prevent race conditions.
   */
  async adjustStock(id: string, delta: number): Promise<void> {
    await this.db.execute(
      `UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2`,
      [delta, id]
    );
  }

  private toDomain(row: Record<string, unknown>): Product {
    return new Product({
      id: String(row.id),
      sku: String(row.sku),
      name: String(row.name),
      price: Money.create(Number(row.price)),
      unit: String(row.unit),
      stock: Number(row.stock),
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    });
  }
}
