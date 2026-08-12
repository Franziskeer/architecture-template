import { Router } from "express";
import type { OrderStatus } from "../domain/order";
import { ValidationError } from "../../shared/errors";
import { childLogger } from "../../shared/logger";
import { mapDomainError } from "../../shared/map-domain-error";
import type { ListByStatus } from "./list-by-status";

const log = childLogger({ feature: "orders", slice: "list-by-status" });

const ORDER_STATUSES: OrderStatus[] = ["draft", "confirmed", "cancelled"];

function parseStatus(value: unknown): OrderStatus {
  if (typeof value !== "string" || !ORDER_STATUSES.includes(value as OrderStatus)) {
    throw new ValidationError("status debe ser draft | confirmed | cancelled", "INVALID_ORDER_STATUS");
  }
  return value as OrderStatus;
}

export function listByStatusRoute(listByStatus: ListByStatus): Router {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      const status = parseStatus(req.query.status);
      const orders = await listByStatus.execute(status);
      log.info({ filterStatus: status, count: orders.length }, "orders_listed");
      res.status(200).json(orders);
    } catch (err) {
      const mapped = mapDomainError(err);
      log.warn({ err, code: mapped.body.code }, "orders_list_failed");
      res.status(mapped.status).json(mapped.body);
    }
  });

  return router;
}
