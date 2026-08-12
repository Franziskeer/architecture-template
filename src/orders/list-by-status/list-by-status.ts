import type { OrderStatus } from "../domain/order";
import type { OrderRepository } from "../domain/order-repository";
import { OrderMapper } from "../order-mapper";
import type { OrderOutput } from "../order-mapper";

/** Slice: listar pedidos por estado */
export class ListByStatus {
  constructor(private readonly orders: OrderRepository) {}

  async execute(status: OrderStatus): Promise<OrderOutput[]> {
    const orders = await this.orders.findByStatus(status);
    return orders.map(OrderMapper.toOutput);
  }
}
