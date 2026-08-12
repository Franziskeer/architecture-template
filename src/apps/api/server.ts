import express from "express";
import path from "node:path";
import { createApplication } from "../../bootstrap";
import { createOrdersRoutes } from "../../orders/orders.routes";
import { createPaymentRoutes } from "../../payments/payments.routes";
import { config } from "../../shared/config";
import { logger } from "../../shared/logger";
import { mapDomainError } from "../../shared/map-domain-error";

/** Raíz del proceso (tsx o `node dist/main.js` desde la raíz del repo). */
const publicDir = path.join(process.cwd(), "public");

/**
 * App Express: middleware, montaje de routers de feature y listen.
 */
export function startApi(port = config.port) {
  const app = createApplication();
  const server = express();

  server.use(express.json());
  server.use(express.static(publicDir));

  server.use((req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => {
      logger.info(
        {
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt,
        },
        "http_request",
      );
    });
    next();
  });

  server.get("/api/health", (_req, res) => {
    res.json({ status: "ok", env: config.nodeEnv });
  });

  server.use(
    "/api/orders",
    createOrdersRoutes({
      createOrder: app.createOrder,
      getOrder: app.getOrder,
      listByStatus: app.listByStatus,
    }),
  );
  server.use("/api/payments", createPaymentRoutes(app.recordPayment));

  server.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const mapped = mapDomainError(error);
    logger.error({ err: error, code: mapped.body.code }, "http_error");
    res.status(mapped.status).json(mapped.body);
  });

  return server.listen(port, () => {
    logger.info(
      {
        port,
        orderRepository: config.orderRepository,
      },
      "api_started",
    );
  });
}
