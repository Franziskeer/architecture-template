/**
 * Composition del feature orders (complejo).
 * Vertical slices + dominio/infra compartidos del feature.
 */
import { config } from "../shared/config";
import { CreateOrder } from "./create-order/create-order";
import type { OrderRepository } from "./domain/order-repository";
import { GetOrder } from "./get-order/get-order";
import { InMemoryOrderRepository } from "./infrastructure/in-memory-order-repository";
import { SqliteOrderRepository } from "./infrastructure/sqlite-order-repository";
import { ListByStatus } from "./list-by-status/list-by-status";

function createOrderRepository(): OrderRepository {
  if (config.orderRepository === "sqlite") {
    return new SqliteOrderRepository(config.sqlitePath);
  }
  return new InMemoryOrderRepository();
}

export function createOrdersModule() {
  const orders = createOrderRepository();

  return {
    createOrder: new CreateOrder(orders, () => crypto.randomUUID()),
    getOrder: new GetOrder(orders),
    listByStatus: new ListByStatus(orders),
  };
}
