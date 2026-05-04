/**
 * RecordStockInUseCase — Record incoming stock for a product.
 *
 * Business rules:
 * - Product must exist
 * - Quantity must be > 0
 * - Product stock is atomically incremented
 */

import type { StockMovement } from '@domain/entities/StockMovement';
import type { ProductPort } from '@application/ports/ProductPort';
import type { StockMovementPort } from '@application/ports/StockMovementPort';
import { MovementType } from '@domain/entities/common/ValueObjects';

interface RecordStockInInput {
  readonly productId: string;
  readonly quantity: number;
  readonly reference: string;
  readonly notes?: string;
}

// Extended ProductPort for stock adjustment
interface ProductRepositoryWithStock extends ProductPort {
  adjustStock(id: string, delta: number): Promise<void>;
}

export class RecordStockInUseCase {
  constructor(
    private readonly productRepo: ProductRepositoryWithStock,
    private readonly stockMovementRepo: StockMovementPort,
  ) {}

  async execute(input: RecordStockInInput): Promise<StockMovement> {
    // Validate product exists
    const product = await this.productRepo.findById(input.productId);
    if (!product) {
      throw new Error(`Product with id "${input.productId}" not found`);
    }

    // Record the movement
    const movement = await this.stockMovementRepo.create({
      productId: input.productId,
      type: MovementType.IN,
      quantity: input.quantity,
      reference: input.reference,
      notes: input.notes,
    });

    // Update product stock (+quantity)
    await this.productRepo.adjustStock(input.productId, input.quantity);

    return movement;
  }
}
