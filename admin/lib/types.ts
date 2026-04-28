export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'deferred' | 'card';
export type UserRole = 'client' | 'commercial' | 'admin';
export type CustomerType = 'artisan' | 'large_installer' | 'wholesaler';
export type StockStatus = 'available' | 'low' | 'out_of_stock' | 'on_order';
export type PricingRuleOperator = 'multiply' | 'add' | 'subtract' | 'fixed';
export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue';
export type QuoteStatus = 'pending' | 'accepted' | 'refused' | 'expired';

export interface PricingRule {
  id: string;
  operator: PricingRuleOperator;
  value: number;
  description: string | null;
  sortOrder: number;
}

export interface PriceSheet {
  id: string;
  name: string;
  appliesTo: CustomerType | null;
  isActive: boolean;
  rules: PricingRule[];
  createdAt: string;
  updatedAt: string;
}

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

export interface Invoice {
  id: string;
  sageRef: string;
  clientId: string;
  orderId: string | null;
  amount: number;
  vatAmount: number;
  status: InvoiceStatus;
  dueDate: string;
  issuedAt: string;
  pdfUrl: string | null;
}

export interface QuoteItem {
  productRef: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  sageRef: string;
  clientId: string;
  items: QuoteItem[];
  totalHT: number;
  status: QuoteStatus;
  validUntil: string;
  issuedAt: string;
  pdfUrl: string | null;
}
