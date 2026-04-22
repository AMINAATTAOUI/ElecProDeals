export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'deferred' | 'card';

export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  clientId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  sageOrderId: string | null;
}

export interface OrderItem {
  productId: string;
  productName: string;
  reference: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
