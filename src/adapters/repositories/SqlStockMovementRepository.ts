/**
 * SqlStockMovementRepository — Implements StockMovementPort using raw SQL.
 */

import type { DatabasePort } from '@application/ports/DatabasePort';
import type { StockMovementPort, CreateStockMovementInput } from '@application/ports/StockMovementPort';
import { StockMovement } from '@domain/entities/StockMovement';
import { Quantity, MovementType } from '@domain/entities/common/ValueObjects';

export class SqlStockMovementRepository implements StockMovementPort {
  constructor(private readonly db: DatabasePort) {}

  async findByProductId(productId: string): Promise<StockMovement[]> {
    const result = await this.db.query(
      `SELECT id, product_id, type, quantity, reference, notes, created_at
       FROM stock_movements WHERE product_id = $1 ORDER BY created_at DESC`,
      [productId]
    );
    return result.rows.map((row) => this.toDomain(row));
  }

  async findAll(limit: number = 50): Promise<StockMovement[]> {
    const result = await this.db.query(
      `SELECT id, product_id, type, quantity, reference, notes, created_at
       FROM stock_movements ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return result.rows.map((row) => this.toDomain(row));
  }

  async create(input: CreateStockMovementInput): Promise<StockMovement> {
    const result = await this.db.query(
      `INSERT INTO stock_movements (product_id, type, quantity, reference, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, product_id, type, quantity, reference, notes, created_at`,
      [input.productId, input.type, input.quantity, input.reference, input.notes ?? null]
    );
    return this.toDomain(result.rows[0]);
  }

  private toDomain(row: Record<string, unknown>): StockMovement {
    return new StockMovement({
      id: String(row.id),
      productId: String(row.product_id),
      type: String(row.type) as MovementType,
      quantity: Quantity.create(Number(row.quantity)),
      reference: String(row.reference),
      notes: row.notes ? String(row.notes) : undefined,
      createdAt: new Date(row.created_at as string),
    });
  }
}
