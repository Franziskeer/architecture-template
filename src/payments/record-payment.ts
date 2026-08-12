/**
 * Feature payments - vertical slice SIMPLE
 * Aún no hay reglas complejas → un solo archivo, sin capas.
 * Si crece, se parte en slices como orders/.
 */
import { ValidationError } from "../shared/errors";
import { Money } from "../shared/money.vo";

export interface RecordPaymentInput {
  orderId: string;
  amount: number;
  currency: string;
}

export interface RecordPaymentResult {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: "recorded";
}

const payments: RecordPaymentResult[] = [];

export async function recordPayment(input: RecordPaymentInput, idGenerator: () => string = () => crypto.randomUUID()): Promise<RecordPaymentResult> {
  if (!input.orderId) {
    throw new ValidationError("orderId es obligatorio", "PAYMENT_ORDER_REQUIRED");
  }

  const money = Money.of(input.amount, input.currency);

  const result: RecordPaymentResult = {
    paymentId: idGenerator(),
    orderId: input.orderId,
    amount: money.amount,
    currency: money.currency,
    status: "recorded",
  };

  payments.push(result);
  return result;
}
