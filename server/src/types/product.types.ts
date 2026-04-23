export type StockStatus = 'available' | 'low' | 'out_of_stock' | 'on_order';

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

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  productIds: string[];
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
}
