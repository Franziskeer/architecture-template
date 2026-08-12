import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApplication } from "../../bootstrap";
import { OrderController } from "../../orders/interface/order.controller";

const publicDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../public"
);

export function startApi(port = 3000) {
  const app = createApplication();
  const orderController = new OrderController(app.createOrder);
  const server = express();

  server.use(express.json());
  server.use(express.static(publicDir));

  server.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  server.post("/api/orders", async (req, res) => {
    const result = await orderController.create(req.body);
    res.status(result.status).json(result.body);
  });

  server.post("/api/payments", async (req, res, next) => {
    try {
      const result = await app.recordPayment(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  server.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      const message = error instanceof Error ? error.message : "Error interno";
      res.status(400).json({ error: message });
    }
  );

  return server.listen(port, () => {
    console.log(`API Express y frontend: http://localhost:${port}`);
  });
}
