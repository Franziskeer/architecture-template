/**
 * USE CASE: obtener un pedido por id
 */
import type { OrderRepository } from "../domain/order.repository";
import type { OrderOutputDto } from "./order.dto";
import { OrderMapper } from "./order.mapper";

export class GetOrderUseCase {
  constructor(private readonly orders: OrderRepository) {}

  async execute(id: string): Promise<OrderOutputDto | null> {
    const order = await this.orders.findById(id);
    return order ? OrderMapper.toOutput(order) : null;
  }
}
