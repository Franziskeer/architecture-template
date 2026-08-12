import { recordPayment } from "./record-payment";

/**
 * Composition del feature payments.
 * Sigue siendo un slice simple: solo expone lo que los adaptadores necesitan.
 */
export function createPaymentsModule() {
  return {
    recordPayment,
  };
}
