export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';
export type PaymentMethod = 'deferred' | 'card';

export interface OrderItem {
  productId: string;
  productRef: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  commercialId: string | null;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  notes: string | null;
  sageOrderRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  items: CreateOrderItemDto[];
  paymentMethod: PaymentMethod;
  notes?: string;
}
