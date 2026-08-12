import type { Order, OrderStatus } from "../domain/order";
import type { OrderRepository } from "../domain/order-repository";

export class InMemoryOrderRepository implements OrderRepository {
  private readonly store = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.store.set(order.id, order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.store.get(id) ?? null;
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return [...this.store.values()].filter((order) => order.getStatus() === status);
  }
}
