/**
 * StockMovement Entity — Enterprise Business Rule.
 *
 * Records a stock movement (in or out) for a product.
 * Zero dependencies on external frameworks.
 */

import { MovementType, Quantity } from './common/ValueObjects';

export interface StockMovementProps {
  readonly id: string;
  readonly productId: string;
  readonly type: MovementType;
  readonly quantity: Quantity;
  readonly reference: string;
  readonly notes?: string;
  readonly createdAt: Date;
}

export class StockMovement {
  private readonly props: StockMovementProps;

  constructor(props: StockMovementProps) {
    this.validate(props);
    this.props = Object.freeze({ ...props });
  }

  private validate(props: StockMovementProps): void {
    if (!props.productId.trim()) throw new Error('Product ID cannot be empty');
    if (props.quantity.isZero()) throw new Error('Movement quantity cannot be zero');
    if (!props.reference.trim()) throw new Error('Movement reference cannot be empty');
  }

  get id(): string { return this.props.id; }
  get productId(): string { return this.props.productId; }
  get type(): MovementType { return this.props.type; }
  get quantity(): Quantity { return this.props.quantity; }
  get reference(): string { return this.props.reference; }
  get notes(): string | undefined { return this.props.notes; }
  get createdAt(): Date { return this.props.createdAt; }

  get isIncoming(): boolean { return this.props.type === MovementType.IN; }
  get isOutgoing(): boolean { return this.props.type === MovementType.OUT; }

  /**
   * Calculate the stock impact (+qty for IN, -qty for OUT).
   */
  get stockImpact(): number {
    return this.isIncoming
      ? this.props.quantity.value
      : -this.props.quantity.value;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      productId: this.productId,
      type: this.type,
      quantity: this.quantity.value,
      reference: this.reference,
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
