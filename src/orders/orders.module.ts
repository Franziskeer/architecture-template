/**
 * Composition del feature orders.
 * Elige el adaptador de persistencia según config (memory | sqlite).
 */
import { config } from "../shared/config";
import { CreateOrderUseCase } from "./application/create-order.use-case";
import { GetOrderUseCase } from "./application/get-order.use-case";
import { ListOrdersByStatusUseCase } from "./application/list-orders-by-status.use-case";
import type { OrderRepository } from "./domain/order.repository";
import { InMemoryOrderRepository } from "./infrastructure/in-memory-order.repository";
import { SqliteOrderRepository } from "./infrastructure/sqlite-order.repository";

function createOrderRepository(): OrderRepository {
  if (config.orderRepository === "sqlite") {
    return new SqliteOrderRepository(config.sqlitePath);
  }
  return new InMemoryOrderRepository();
}

export function createOrdersModule() {
  const orderRepository = createOrderRepository();

  return {
    createOrder: new CreateOrderUseCase(
      orderRepository,
      () => crypto.randomUUID()
    ),
    getOrder: new GetOrderUseCase(orderRepository),
    listOrdersByStatus: new ListOrdersByStatusUseCase(orderRepository),
  };
}
