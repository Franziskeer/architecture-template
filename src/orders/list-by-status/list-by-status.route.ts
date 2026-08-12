import { Router } from "express";
import type { OrderStatus } from "../domain/order";
import { childLogger } from "../../shared/logger";
import type { ListByStatus } from "./list-by-status";

const log = childLogger({ feature: "orders", slice: "list-by-status" });

const ORDER_STATUSES: OrderStatus[] = ["draft", "confirmed", "cancelled"];

function parseStatus(value: unknown): OrderStatus | null {
  if (typeof value !== "string") return null;
  return ORDER_STATUSES.includes(value as OrderStatus)
    ? (value as OrderStatus)
    : null;
}

export function listByStatusRoute(listByStatus: ListByStatus): Router {
  const router = Router();

  router.get("/", async (req, res) => {
    const status = parseStatus(req.query.status);
    if (!status) {
      res.status(400).json({
        error: "status debe ser draft | confirmed | cancelled",
      });
      return;
    }

    const orders = await listByStatus.execute(status);
    log.info({ filterStatus: status, count: orders.length }, "orders_listed");
    res.status(200).json(orders);
  });

  return router;
}
