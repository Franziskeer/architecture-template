import { Router } from "express";
import { childLogger } from "../../shared/logger";
import { mapDomainError } from "../../shared/map-domain-error";
import type { GetOrder } from "./get-order";

const log = childLogger({ feature: "orders", slice: "get-order" });

export function getOrderRoute(getOrder: GetOrder): Router {
  const router = Router();

  router.get("/:id", async (req, res) => {
    const orderId = String(req.params.id);
    if (!orderId) {
      res.status(400).json({ error: "id obligatorio", code: "INVALID_PAYLOAD" });
      return;
    }

    try {
      const order = await getOrder.execute(orderId);
      log.info({ orderId }, "order_fetched");
      res.status(200).json(order);
    } catch (err) {
      const mapped = mapDomainError(err);
      log.warn({ err, orderId, code: mapped.body.code }, "order_fetch_failed");
      res.status(mapped.status).json(mapped.body);
    }
  });

  return router;
}
