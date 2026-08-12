import { Router } from "express";
import { childLogger } from "../../shared/logger";
import { mapDomainError } from "../../shared/map-domain-error";
import type { CreateOrder } from "./create-order";
import type { CreateOrderInput } from "./create-order.dto";

const log = childLogger({ feature: "orders", slice: "create-order" });

export function createOrderRoute(createOrder: CreateOrder): Router {
  const router = Router();

  router.post("/", async (req, res) => {
    const input = req.body as CreateOrderInput;

    if (!input?.customerId || !Array.isArray(input.items)) {
      log.warn({ body: req.body }, "order_create_invalid_payload");
      res.status(400).json({ error: "payload inválido", code: "INVALID_PAYLOAD" });
      return;
    }

    try {
      const order = await createOrder.execute(input);
      log.info({ orderId: order.id }, "order_created");
      res.status(201).json(order);
    } catch (err) {
      const mapped = mapDomainError(err);
      log.warn({ err, code: mapped.body.code }, "order_create_failed");
      res.status(mapped.status).json(mapped.body);
    }
  });

  return router;
}
