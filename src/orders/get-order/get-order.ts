import type { OrderRepository } from "../domain/order-repository";
import { OrderMapper } from "../order-mapper";
import type { OrderOutput } from "../order-mapper";

/** Slice: obtener pedido por id */
export class GetOrder {
  constructor(private readonly orders: OrderRepository) {}

  async execute(id: string): Promise<OrderOutput | null> {
    const order = await this.orders.findById(id);
    return order ? OrderMapper.toOutput(order) : null;
  }
}
