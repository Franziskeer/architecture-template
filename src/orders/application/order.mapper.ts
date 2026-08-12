/**
 * MAPPER del feature orders
 */
import { Money } from "../../shared/money.vo";
import { Order, OrderItem } from "../domain/order.entity";
import type { CreateOrderInputDto, OrderOutputDto } from "./order.dto";

export class OrderMapper {
  static toDomain(id: string, input: CreateOrderInputDto): Order {
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

  static toOutput(order: Order): OrderOutputDto {
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
