import { Router } from "express";
import type { RecordPaymentInput } from "./record-payment";
import { recordPayment } from "./record-payment";

type RecordPayment = (input: RecordPaymentInput) => Promise<unknown>;

/**
 * Rutas HTTP del feature payments.
 * Slice simple: router aquí; si crece, muévelo a interface/.
 */
export function createPaymentRoutes(record: RecordPayment = recordPayment): Router {
  const router = Router();

  router.post("/", async (req, res, next) => {
    try {
      const result = await record(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
