export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'deferred' | 'card';
export type UserRole = 'client' | 'commercial' | 'admin';
export type CustomerType = 'standard' | 'large_installer' | 'wholesaler';
export type StockStatus = 'available' | 'low' | 'out_of_stock' | 'on_order';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  siret: string | null;
  isActive: boolean;
  customerType: CustomerType | null;
  pricingSheetId: string | null;
  isPaymentDeferred: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  sageRef: string;
  name: string;
  description: string;
  category: string;
  publicPrice: number;
  unit: string;
  stockStatus: StockStatus;
  estimatedDeliveryDays: number | null;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
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
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  total: number;
  notes: string | null;
  sageOrderRef: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
