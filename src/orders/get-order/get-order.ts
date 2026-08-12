import type { OrderRepository } from "../domain/order-repository";
import { OrderMapper } from "../order-mapper";
import type { OrderOutput } from "../order-mapper";
import { NotFoundError } from "../../shared/errors";

/** Slice: obtener pedido por id */
export class GetOrder {
  constructor(private readonly orders: OrderRepository) {}

  async execute(id: string): Promise<OrderOutput> {
    const order = await this.orders.findById(id);
    if (!order) {
      throw new NotFoundError(`Pedido no encontrado: ${id}`, "ORDER_NOT_FOUND");
    }
    return OrderMapper.toOutput(order);
  }
}
