export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
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
  clientId: string;
  commercialId: string | null;
  items: OrderItem[];
  totalHT: number;
  totalTTC: number;
  vatRate: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  sageOrderRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}
