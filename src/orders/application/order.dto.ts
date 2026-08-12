/**
 * DTOs del feature orders
 */
export interface CreateOrderInputDto {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    currency: string;
  }>;
}

export interface OrderOutputDto {
  id: string;
  customerId: string;
  status: string;
  total: number;
  currency: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}
