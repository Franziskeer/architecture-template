import { createOrdersModule } from "./orders/orders.module";
import { createPaymentsModule } from "./payments/payments.module";

/**
 * Composition root fino: junta módulos de feature.
 * No registra clases sueltas; cada feature se compone a sí mismo.
 */
export function createApplication() {
  return {
    ...createOrdersModule(),
    ...createPaymentsModule(),
  };
}
