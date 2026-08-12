import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApplication } from "../../bootstrap";
import { createOrderRoutes } from "../../orders/interface/order.routes";
import { createPaymentRoutes } from "../../payments/payments.routes";
import { config } from "../../shared/config";

const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../public");

/**
 * App Express: middleware, montaje de routers de feature y listen.
 * Las rutas concretas viven en cada feature.
 */
export function startApi(port = config.port) {
  const app = createApplication();
  const server = express();

  server.use(express.json());
  server.use(express.static(publicDir));

  server.get("/api/health", (_req, res) => {
    res.json({ status: "ok", env: config.nodeEnv });
  });

  server.use("/api/orders", createOrderRoutes(app.createOrder));
  server.use("/api/payments", createPaymentRoutes(app.recordPayment));

  server.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = error instanceof Error ? error.message : "Error interno";
    res.status(400).json({ error: message });
  });

  return server.listen(port, () => {
    console.log(`API Express y frontend: http://localhost:${port} (${config.nodeEnv})`);
  });
}
