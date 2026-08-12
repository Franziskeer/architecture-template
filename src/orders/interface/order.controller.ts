/**
 * Adaptador de entrada HTTP del feature orders
 */
import type { CreateOrderUseCase } from "../application/create-order.use-case";
import type { GetOrderUseCase } from "../application/get-order.use-case";
import type { CreateOrderInputDto } from "../application/order.dto";

export class OrderController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly getOrder: GetOrderUseCase
  ) {}

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

  async getById(id: string): Promise<{ status: number; body: unknown }> {
    if (!id) {
      return { status: 400, body: { error: "id obligatorio" } };
    }

    const order = await this.getOrder.execute(id);
    if (!order) {
      return { status: 404, body: { error: "pedido no encontrado" } };
    }

    return { status: 200, body: order };
  }
}
