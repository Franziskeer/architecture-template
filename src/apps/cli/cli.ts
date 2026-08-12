import { createApplication } from "../../bootstrap";
import { config } from "../../shared/config";
import { logger } from "../../shared/logger";

function readFlag(name: string): string | undefined {
  const position = process.argv.indexOf(`--${name}`);
  return position >= 0 ? process.argv[position + 1] : undefined;
}

function requiredFlag(name: string): string {
  const value = readFlag(name);
  if (!value) throw new Error(`Falta --${name}`);
  return value;
}

async function run(): Promise<void> {
  const command = process.argv[2];
  const app = createApplication();
  const log = logger.child({ channel: "cli", command });

  if (command === "create-order") {
    const result = await app.createOrder.execute({
      customerId: requiredFlag("customer"),
      items: [
        {
          productId: requiredFlag("product"),
          quantity: Number(requiredFlag("quantity")),
          unitPrice: Number(requiredFlag("price")),
          currency: readFlag("currency") ?? "EUR",
        },
      ],
    });

    log.info({ orderId: result.id }, "cli_create_order_ok");
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === "get-order") {
    const orderId = requiredFlag("id");
    const order = await app.getOrder.execute(orderId);
    if (!order) {
      log.warn({ orderId }, "cli_order_not_found");
      console.error("pedido no encontrado");
      process.exitCode = 1;
      return;
    }
    log.info({ orderId }, "cli_get_order_ok");
    console.log(JSON.stringify(order, null, 2));
    return;
  }

  if (command === "list-orders") {
    const status = requiredFlag("status") as
      | "draft"
      | "confirmed"
      | "cancelled";
    if (!["draft", "confirmed", "cancelled"].includes(status)) {
      throw new Error("status debe ser draft | confirmed | cancelled");
    }
    const orders = await app.listByStatus.execute(status);
    log.info({ status, count: orders.length }, "cli_list_orders_ok");
    console.log(JSON.stringify(orders, null, 2));
    return;
  }

  if (command === "record-payment") {
    const result = await app.recordPayment({
      orderId: requiredFlag("order"),
      amount: Number(requiredFlag("amount")),
      currency: readFlag("currency") ?? "EUR",
    });

    log.info({ paymentId: result.paymentId }, "cli_record_payment_ok");
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(
    `
Entorno: ${config.nodeEnv}
Orders repo: ${config.orderRepository}

Uso:
  npm run cli -- create-order --customer cust-1 --product sku-42 --quantity 2 --price 10
  npm run cli -- get-order --id <order-id>
  npm run cli -- list-orders --status confirmed
  npm run cli -- record-payment --order order-1 --amount 20
  `.trim()
  );
}

run().catch((error) => {
  logger.error({ err: error, channel: "cli" }, "cli_failed");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
