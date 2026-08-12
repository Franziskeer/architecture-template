import { CreateOrderUseCase } from "./application/create-order.use-case";
import { InMemoryOrderRepository } from "./infrastructure/in-memory-order.repository";

/**
 * Composition del feature orders.
 * Aquí se cablean repo + use cases de este módulo, no de toda la app.
 */
export function createOrdersModule() {
  const orderRepository = new InMemoryOrderRepository();

  return {
    createOrder: new CreateOrderUseCase(
      orderRepository,
      () => crypto.randomUUID()
    ),
  };
}
