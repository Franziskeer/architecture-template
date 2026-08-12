/**
 * Puerto de persistencia del feature orders.
 */
import type { Order, OrderStatus } from "./order";

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
}
