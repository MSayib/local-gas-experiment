/**
 * GetStockSummaryUseCase — Calculate real stock summary from database.
 */

import type { DatabasePort } from '@application/ports/DatabasePort';

export interface StockSummary {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
}

export class GetStockSummaryUseCase {
  constructor(private readonly db: DatabasePort) {}

  async execute(lowStockThreshold: number = 10): Promise<StockSummary> {
    const result = await this.db.query(
      `SELECT
         COUNT(*)::int AS total_products,
         COALESCE(SUM(stock), 0)::int AS total_stock,
         COALESCE(SUM(stock * price), 0)::float AS total_value,
         COUNT(*) FILTER (WHERE stock <= $1)::int AS low_stock_count
       FROM products`,
      [lowStockThreshold]
    );

    const row = result.rows[0];
    return {
      totalProducts: Number(row.total_products),
      totalStock: Number(row.total_stock),
      totalValue: Number(row.total_value),
      lowStockCount: Number(row.low_stock_count),
    };
  }
}
