import { createApplication } from "../../bootstrap";
import { config } from "../../shared/config";

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

  if (command === "create-order") {
    const result = await app.createOrder.execute({
      customerId: requiredFlag("customer"),
      items: [{
        productId: requiredFlag("product"),
        quantity: Number(requiredFlag("quantity")),
        unitPrice: Number(requiredFlag("price")),
        currency: readFlag("currency") ?? "EUR",
      }],
    });

    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === "record-payment") {
    const result = await app.recordPayment({
      orderId: requiredFlag("order"),
      amount: Number(requiredFlag("amount")),
      currency: readFlag("currency") ?? "EUR",
    });

    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`
Entorno: ${config.nodeEnv}

Uso:
  npm run cli -- create-order --customer cust-1 --product sku-42 --quantity 2 --price 10
  npm run cli -- record-payment --order order-1 --amount 20
  `.trim());
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
