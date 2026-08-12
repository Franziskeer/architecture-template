export interface CreateOrderInput {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    currency: string;
  }>;
}
