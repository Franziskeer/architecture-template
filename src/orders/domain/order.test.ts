import { describe, expect, it } from "vitest";
import { ValidationError } from "../../shared/errors";
import { Money } from "../../shared/money.vo";
import { Order, OrderItem } from "./order";

describe("Order", () => {
  const item = () => new OrderItem("sku-1", 2, Money.of(10, "EUR"));

  it("creates a draft order and computes total", () => {
    const order = Order.create("o-1", "cust-1", [item()]);

    expect(order.getStatus()).toBe("draft");
    expect(order.total().amount).toBe(20);
    expect(order.total().currency).toBe("EUR");
  });

  it("confirms a draft order", () => {
    const order = Order.create("o-1", "cust-1", [item()]);

    order.confirm();

    expect(order.getStatus()).toBe("confirmed");
  });

  it("rejects empty orders", () => {
    expect(() => Order.create("o-1", "cust-1", [])).toThrow(ValidationError);
    expect(() => Order.create("o-1", "cust-1", [])).toThrow(/al menos un ítem/);
  });

  it("rejects confirming a non-draft order", () => {
    const order = Order.create("o-1", "cust-1", [item()]);
    order.confirm();

    expect(() => order.confirm()).toThrow(ValidationError);
  });

  it("rejects invalid item quantity", () => {
    expect(() => new OrderItem("sku-1", 0, Money.of(10, "EUR"))).toThrow(ValidationError);
  });
});
