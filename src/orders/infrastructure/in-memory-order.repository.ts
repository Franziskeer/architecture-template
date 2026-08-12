/**
 * Adaptador de infraestructura del feature orders
 */
import type { Order } from "../domain/order.entity";
import type { OrderRepository } from "../domain/order.repository";

/** Modelo de persistencia (fila/documento). Solo existe si diverge del dominio. */
export interface OrderPersistenceModel {
  id: string;
  customer_id: string;
  status: string;
  items_json: string;
}

export class InMemoryOrderRepository implements OrderRepository {
  private readonly store = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.store.set(order.id, order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.store.get(id) ?? null;
  }
}
