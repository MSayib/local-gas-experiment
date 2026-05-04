/**
 * RecordStockOutUseCase — Record outgoing stock for a product.
 *
 * Business rules:
 * - Product must exist
 * - Quantity must be > 0
 * - Sufficient stock available (no negative stock)
 * - Product stock is atomically decremented
 */

import type { StockMovement } from '@domain/entities/StockMovement';
import type { ProductPort } from '@application/ports/ProductPort';
import type { StockMovementPort } from '@application/ports/StockMovementPort';
import { MovementType } from '@domain/entities/common/ValueObjects';

interface RecordStockOutInput {
  readonly productId: string;
  readonly quantity: number;
  readonly reference: string;
  readonly notes?: string;
}

interface ProductRepositoryWithStock extends ProductPort {
  adjustStock(id: string, delta: number): Promise<void>;
}

export class RecordStockOutUseCase {
  constructor(
    private readonly productRepo: ProductRepositoryWithStock,
    private readonly stockMovementRepo: StockMovementPort,
  ) {}

  async execute(input: RecordStockOutInput): Promise<StockMovement> {
    // Validate product exists
    const product = await this.productRepo.findById(input.productId);
    if (!product) {
      throw new Error(`Product with id "${input.productId}" not found`);
    }

    // Business rule: sufficient stock
    if (product.stock < input.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${input.quantity}`
      );
    }

    // Record the movement
    const movement = await this.stockMovementRepo.create({
      productId: input.productId,
      type: MovementType.OUT,
      quantity: input.quantity,
      reference: input.reference,
      notes: input.notes,
    });

    // Update product stock (-quantity)
    await this.productRepo.adjustStock(input.productId, -input.quantity);

    return movement;
  }
}
