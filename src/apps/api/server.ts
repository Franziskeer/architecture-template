import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { createApplication } from "../../bootstrap";
import { OrderController } from "../../orders/interface/order.controller";

const frontendUrl = new URL("../../../public/index.html", import.meta.url);

function sendJson(
  response: ServerResponse,
  status: number,
  body: unknown
): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function startApi(port = 3000) {
  const app = createApplication();
  const orderController = new OrderController(app.createOrder);

  const server = createServer(async (request, response) => {
    try {
      if (request.method === "GET" && request.url === "/") {
        const html = await readFile(frontendUrl);
        response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        response.end(html);
        return;
      }

      if (request.method === "GET" && request.url === "/api/health") {
        sendJson(response, 200, { status: "ok" });
        return;
      }

      if (request.method === "POST" && request.url === "/api/orders") {
        const result = await orderController.create(await readJson(request));
        sendJson(response, result.status, result.body);
        return;
      }

      if (request.method === "POST" && request.url === "/api/payments") {
        const result = await app.recordPayment(await readJson(request) as {
          orderId: string;
          amount: number;
          currency: string;
        });
        sendJson(response, 201, result);
        return;
      }

      sendJson(response, 404, { error: "Ruta no encontrada" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error interno";
      sendJson(response, 400, { error: message });
    }
  });

  return server.listen(port, () => {
    console.log(`API y frontend: http://localhost:${port}`);
  });
}
