/**
 * Value Objects — Shared domain primitives.
 *
 * Immutable, self-validating value types used across entities.
 */

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
}

export class Money {
  private constructor(private readonly _amount: number) {}

  static create(amount: number): Money {
    if (amount < 0) throw new Error('Money amount cannot be negative');
    return new Money(Math.round(amount * 100) / 100);
  }

  get amount(): number {
    return this._amount;
  }

  add(other: Money): Money {
    return Money.create(this._amount + other._amount);
  }

  multiply(factor: number): Money {
    return Money.create(this._amount * factor);
  }

  toString(): string {
    return this._amount.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
    });
  }
}

export class Quantity {
  private constructor(private readonly _value: number) {}

  static create(value: number): Quantity {
    if (value < 0) throw new Error('Quantity cannot be negative');
    if (!Number.isFinite(value)) throw new Error('Quantity must be finite');
    return new Quantity(value);
  }

  get value(): number {
    return this._value;
  }

  add(other: Quantity): Quantity {
    return Quantity.create(this._value + other._value);
  }

  subtract(other: Quantity): Quantity {
    return Quantity.create(this._value - other._value);
  }

  isZero(): boolean {
    return this._value === 0;
  }
}
