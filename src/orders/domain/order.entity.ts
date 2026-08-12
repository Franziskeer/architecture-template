/**
 * ENTITY (dominio de orders)
 */
import { Money } from "../../shared/money.vo";

export type OrderStatus = "draft" | "confirmed" | "cancelled";

export class Order {
  private constructor(
    readonly id: string,
    readonly customerId: string,
    private items: OrderItem[],
    private status: OrderStatus
  ) {}

  static create(id: string, customerId: string, items: OrderItem[]): Order {
    if (!items.length) {
      throw new Error("Un pedido necesita al menos un ítem");
    }
    return new Order(id, customerId, items, "draft");
  }

  confirm(): void {
    if (this.status !== "draft") {
      throw new Error("Solo se puede confirmar un pedido en borrador");
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
    return this.items.reduce(
      (sum, item) => sum.add(item.lineTotal()),
      Money.zero("EUR")
    );
  }
}

export class OrderItem {
  constructor(
    readonly productId: string,
    readonly quantity: number,
    readonly unitPrice: Money
  ) {
    if (quantity <= 0) throw new Error("quantity debe ser > 0");
  }

  lineTotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }
}
