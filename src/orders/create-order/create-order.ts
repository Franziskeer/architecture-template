import type { OrderRepository } from "../domain/order-repository";
import { OrderMapper } from "../order-mapper";
import type { OrderOutput } from "../order-mapper";
import type { CreateOrderInput } from "./create-order.dto";

/** Slice: crear pedido */
export class CreateOrder {
  constructor(
    private readonly orders: OrderRepository,
    private readonly idGenerator: () => string
  ) {}

  async execute(input: CreateOrderInput): Promise<OrderOutput> {
    const order = OrderMapper.toDomain(this.idGenerator(), input);
    order.confirm();
    await this.orders.save(order);
    return OrderMapper.toOutput(order);
  }
}
