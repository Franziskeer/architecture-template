import { recordPayment } from "./record-payment";

/**
 * Composition del feature payments (SIMPLE).
 * Un solo flujo: no hace falta vertical slices ni capas.
 */
export function createPaymentsModule() {
  return {
    recordPayment,
  };
}
