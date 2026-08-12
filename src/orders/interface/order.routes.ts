import { Router } from "express";
import type { CreateOrderUseCase } from "../application/create-order.use-case";
import type { GetOrderUseCase } from "../application/get-order.use-case";
import { OrderController } from "./order.controller";

/**
 * Rutas HTTP del feature orders.
 * El server solo monta este router; no conoce los endpoints internos.
 */
export function createOrderRoutes(
  createOrder: CreateOrderUseCase,
  getOrder: GetOrderUseCase
): Router {
  const router = Router();
  const controller = new OrderController(createOrder, getOrder);

  router.post("/", async (req, res) => {
    const result = await controller.create(req.body);
    res.status(result.status).json(result.body);
  });

  router.get("/:id", async (req, res) => {
    const result = await controller.getById(req.params.id);
    res.status(result.status).json(result.body);
  });

  return router;
}
