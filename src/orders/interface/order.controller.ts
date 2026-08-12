/**
 * Adaptador de entrada HTTP del feature orders
 */
import type { CreateOrderUseCase } from "../application/create-order.use-case";
import type { CreateOrderInputDto } from "../application/order.dto";

export class OrderController {
  constructor(private readonly createOrder: CreateOrderUseCase) {}

  async create(body: unknown): Promise<{ status: number; body: unknown }> {
    const input = body as CreateOrderInputDto;

    if (!input?.customerId || !Array.isArray(input.items)) {
      return { status: 400, body: { error: "payload inválido" } };
    }

    try {
      const result = await this.createOrder.execute(input);
      return { status: 201, body: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : "error";
      return { status: 422, body: { error: message } };
    }
  }
}
