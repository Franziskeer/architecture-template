import { Router } from "express";
import { childLogger } from "../../shared/logger";
import type { GetOrder } from "./get-order";

const log = childLogger({ feature: "orders", slice: "get-order" });

export function getOrderRoute(getOrder: GetOrder): Router {
  const router = Router();

  router.get("/:id", async (req, res) => {
    const orderId = String(req.params.id);
    if (!orderId) {
      res.status(400).json({ error: "id obligatorio" });
      return;
    }

    const order = await getOrder.execute(orderId);
    if (!order) {
      log.warn({ orderId }, "order_not_found");
      res.status(404).json({ error: "pedido no encontrado" });
      return;
    }

    log.info({ orderId }, "order_fetched");
    res.status(200).json(order);
  });

  return router;
}
