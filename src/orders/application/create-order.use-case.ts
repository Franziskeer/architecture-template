/**
 * USE CASE del feature orders
 */
import type { OrderRepository } from "../domain/order.repository";
import type { CreateOrderInputDto, OrderOutputDto } from "./order.dto";
import { OrderMapper } from "./order.mapper";

export class CreateOrderUseCase {
  constructor(
    private readonly orders: OrderRepository,
    private readonly idGenerator: () => string
  ) {}

  async execute(input: CreateOrderInputDto): Promise<OrderOutputDto> {
    const order = OrderMapper.toDomain(this.idGenerator(), input);
    order.confirm();
    await this.orders.save(order);
    return OrderMapper.toOutput(order);
  }
}
