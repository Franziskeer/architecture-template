/**
 * Entity del feature orders (dominio compartido entre slices).
 */
import { ValidationError } from "../../shared/errors";
import { Money } from "../../shared/money.vo";

export type OrderStatus = "draft" | "confirmed" | "cancelled";

export class Order {
  private constructor(
    readonly id: string,
    readonly customerId: string,
    private items: OrderItem[],
    private status: OrderStatus,
  ) {}

  static create(id: string, customerId: string, items: OrderItem[]): Order {
    if (!items.length) {
      throw new ValidationError("Un pedido necesita al menos un ítem", "ORDER_EMPTY");
    }
    return new Order(id, customerId, items, "draft");
  }

  /** Rehidrata un pedido ya persistido (infra → dominio). */
  static reconstitute(id: string, customerId: string, items: OrderItem[], status: OrderStatus): Order {
    if (!items.length) {
      throw new ValidationError("Un pedido necesita al menos un ítem", "ORDER_EMPTY");
    }
    return new Order(id, customerId, items, status);
  }

  confirm(): void {
    if (this.status !== "draft") {
      throw new ValidationError("Solo se puede confirmar un pedido en borrador", "ORDER_NOT_DRAFT");
    }
    this.status = "confirmed";
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  getItems(): readonly OrderItem[] {
    return this.items;
  }

  total(): Money {
    return this.items.reduce((sum, item) => sum.add(item.lineTotal()), Money.zero("EUR"));
  }
}

export class OrderItem {
  constructor(
    readonly productId: string,
    readonly quantity: number,
    readonly unitPrice: Money,
  ) {
    if (quantity <= 0) {
      throw new ValidationError("quantity debe ser > 0", "INVALID_QUANTITY");
    }
  }

  lineTotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }
}
