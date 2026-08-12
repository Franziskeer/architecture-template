import { describe, expect, it } from "vitest";
import { ValidationError } from "../../shared/errors";
import { InMemoryOrderRepository } from "../infrastructure/in-memory-order-repository";
import { CreateOrder } from "./create-order";

describe("CreateOrder", () => {
  it("creates, confirms and persists an order", async () => {
    const repo = new InMemoryOrderRepository();
    const createOrder = new CreateOrder(repo, () => "fixed-id");

    const result = await createOrder.execute({
      customerId: "cust-1",
      items: [{ productId: "sku-42", quantity: 2, unitPrice: 10, currency: "EUR" }],
    });

    expect(result).toMatchObject({
      id: "fixed-id",
      customerId: "cust-1",
      status: "confirmed",
      total: 20,
      currency: "EUR",
    });

    const stored = await repo.findById("fixed-id");
    expect(stored?.getStatus()).toBe("confirmed");
  });

  it("propagates domain validation errors", async () => {
    const createOrder = new CreateOrder(new InMemoryOrderRepository(), () => "fixed-id");

    await expect(
      createOrder.execute({
        customerId: "cust-1",
        items: [{ productId: "sku-42", quantity: 0, unitPrice: 10, currency: "EUR" }],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
