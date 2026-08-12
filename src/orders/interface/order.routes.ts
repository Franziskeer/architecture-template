import { Router } from "express";
import type { CreateOrderUseCase } from "../application/create-order.use-case";
import type { GetOrderUseCase } from "../application/get-order.use-case";
import type { ListOrdersByStatusUseCase } from "../application/list-orders-by-status.use-case";
import { OrderController } from "./order.controller";

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
    res.status(result.status).json(result.body);
  });

  // Antes de /:id para no capturar "status" como id
  router.get("/", async (req, res) => {
    const result = await controller.listByStatusQuery(req.query.status);
    res.status(result.status).json(result.body);
  });

  router.get("/:id", async (req, res) => {
    const result = await controller.getById(String(req.params.id));
    res.status(result.status).json(result.body);
  });

  return router;
}
