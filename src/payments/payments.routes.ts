import { Router } from "express";
import { childLogger } from "../shared/logger";
import { mapDomainError } from "../shared/map-domain-error";
import type { RecordPaymentInput } from "./record-payment";
import { recordPayment } from "./record-payment";

type RecordPayment = (input: RecordPaymentInput) => Promise<unknown>;

const log = childLogger({ feature: "payments" });

/**
 * Rutas HTTP del feature payments (simple).
 */
export function createPaymentRoutes(record: RecordPayment = recordPayment): Router {
  const router = Router();

  router.post("/", async (req, res) => {
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
      const mapped = mapDomainError(error);
      log.warn({ err: error, code: mapped.body.code }, "payment_record_failed");
      res.status(mapped.status).json(mapped.body);
    }
  });

  return router;
}
