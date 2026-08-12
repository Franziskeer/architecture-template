import { CreateOrderUseCase } from "./orders/application/create-order.use-case";
import { InMemoryOrderRepository } from "./orders/infrastructure/in-memory-order.repository";
import { recordPayment } from "./payments/record-payment";

/**
 * Composition root compartido por API y CLI.
 *
 * Conecta puertos con adaptadores concretos. Ningún caso de uso necesita
 * saber si fue invocado desde HTTP, un frontend o la terminal.
 */
export function createApplication() {
  const orderRepository = new InMemoryOrderRepository();
  const createOrder = new CreateOrderUseCase(
    orderRepository,
    () => crypto.randomUUID()
  );

  return {
    createOrder,
    recordPayment,
  };
}
