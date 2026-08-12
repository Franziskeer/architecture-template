import { Router } from "express";
import { childLogger } from "../shared/logger";
import type { RecordPaymentInput } from "./record-payment";
import { recordPayment } from "./record-payment";

type RecordPayment = (input: RecordPaymentInput) => Promise<unknown>;

const log = childLogger({ feature: "payments" });

/**
 * Rutas HTTP del feature payments.
 * Slice simple: router aquí; si crece, muévelo a interface/.
 */
export function createPaymentRoutes(record: RecordPayment = recordPayment): Router {
  const router = Router();

  router.post("/", async (req, res, next) => {
    try {
      const result = await record(req.body);
      log.info(
        {
          orderId: (result as { orderId?: string }).orderId,
          paymentId: (result as { paymentId?: string }).paymentId,
        },
        "payment_recorded",
      );
      res.status(201).json(result);
    } catch (error) {
      log.error({ err: error }, "payment_record_failed");
      next(error);
    }
  });

  return router;
}
