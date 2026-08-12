/**
 * DTO de salida y mapper compartidos por los slices de orders.
 */
import { Money } from "../shared/money.vo";
import { Order, OrderItem } from "./domain/order";
import type { CreateOrderInput } from "./create-order/create-order.dto";

export interface OrderOutput {
  id: string;
  customerId: string;
  status: string;
  total: number;
  currency: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export class OrderMapper {
  static toDomain(id: string, input: CreateOrderInput): Order {
    const items = input.items.map(
      (i) =>
        new OrderItem(
          i.productId,
          i.quantity,
          Money.of(i.unitPrice, i.currency)
        )
    );
    return Order.create(id, input.customerId, items);
  }

  static toOutput(order: Order): OrderOutput {
    const total = order.total();
    return {
      id: order.id,
      customerId: order.customerId,
      status: order.getStatus(),
      total: total.amount,
      currency: total.currency,
      items: order.getItems().map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice.amount,
      })),
    };
  }
}
