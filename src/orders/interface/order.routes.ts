import { Router } from "express";
import type { CreateOrderUseCase } from "../application/create-order.use-case";
import type { GetOrderUseCase } from "../application/get-order.use-case";
import type { ListOrdersByStatusUseCase } from "../application/list-orders-by-status.use-case";
import { childLogger } from "../../shared/logger";
import { OrderController } from "./order.controller";

const log = childLogger({ feature: "orders" });

/**
 * Rutas HTTP del feature orders.
 * El server solo monta este router; no conoce los endpoints internos.
 */
export function createOrderRoutes(
  createOrder: CreateOrderUseCase,
  getOrder: GetOrderUseCase,
  listByStatus: ListOrdersByStatusUseCase
): Router {
  const router = Router();
  const controller = new OrderController(createOrder, getOrder, listByStatus);

  router.post("/", async (req, res) => {
    const result = await controller.create(req.body);
    if (result.status >= 400) {
      log.warn({ statusCode: result.status, body: result.body }, "order_create_failed");
    } else {
      log.info(
        { statusCode: result.status, orderId: (result.body as { id?: string }).id },
        "order_created"
      );
    }
    res.status(result.status).json(result.body);
  });

  // Antes de /:id para no capturar "status" como id
  router.get("/", async (req, res) => {
    const result = await controller.listByStatusQuery(req.query.status);
    log.info(
      {
        statusCode: result.status,
        filterStatus: req.query.status,
        count: Array.isArray(result.body) ? result.body.length : undefined,
      },
      "orders_listed"
    );
    res.status(result.status).json(result.body);
  });

  router.get("/:id", async (req, res) => {
    const orderId = String(req.params.id);
    const result = await controller.getById(orderId);
    if (result.status === 404) {
      log.warn({ orderId }, "order_not_found");
    } else {
      log.info({ orderId, statusCode: result.status }, "order_fetched");
    }
    res.status(result.status).json(result.body);
  });

  return router;
}
