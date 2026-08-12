import { Router } from "express";
import { createOrderRoute } from "./create-order/create-order.route";
import type { CreateOrder } from "./create-order/create-order";
import { getOrderRoute } from "./get-order/get-order.route";
import type { GetOrder } from "./get-order/get-order";
import { listByStatusRoute } from "./list-by-status/list-by-status.route";
import type { ListByStatus } from "./list-by-status/list-by-status";

/**
 * Compone los routers de cada slice del feature orders.
 */
export function createOrdersRoutes(deps: { createOrder: CreateOrder; getOrder: GetOrder; listByStatus: ListByStatus }): Router {
  const router = Router();

  router.use(createOrderRoute(deps.createOrder));
  // Antes de /:id para no capturar rutas ambiguas
  router.use(listByStatusRoute(deps.listByStatus));
  router.use(getOrderRoute(deps.getOrder));

  return router;
}
