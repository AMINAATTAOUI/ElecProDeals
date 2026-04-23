export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'deferred' | 'card';

export interface CartItem {
  productId: string;
  productName: string;
  productRef: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productRef: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  createdAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  notes?: string;
}
