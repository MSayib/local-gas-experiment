/**
 * StockMovementPort — Interface for Stock Movement data access.
 */

import type { StockMovement } from '@domain/entities/StockMovement';
import type { MovementType } from '@domain/entities/common/ValueObjects';

export interface CreateStockMovementInput {
  readonly productId: string;
  readonly type: MovementType;
  readonly quantity: number;
  readonly reference: string;
  readonly notes?: string;
}

export interface StockMovementPort {
  findByProductId(productId: string): Promise<StockMovement[]>;
  findAll(limit?: number): Promise<StockMovement[]>;
  create(input: CreateStockMovementInput): Promise<StockMovement>;
}
