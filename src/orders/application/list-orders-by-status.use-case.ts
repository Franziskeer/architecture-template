/**
 * USE CASE: listar pedidos por estado
 */
import type { OrderStatus } from "../domain/order.entity";
import type { OrderRepository } from "../domain/order.repository";
import type { OrderOutputDto } from "./order.dto";
import { OrderMapper } from "./order.mapper";

export class ListOrdersByStatusUseCase {
  constructor(private readonly orders: OrderRepository) {}

  async execute(status: OrderStatus): Promise<OrderOutputDto[]> {
    const orders = await this.orders.findByStatus(status);
    return orders.map(OrderMapper.toOutput);
  }
}
