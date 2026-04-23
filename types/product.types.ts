export type StockStatus = 'available' | 'low' | 'out_of_stock' | 'on_order';

export interface ProductPricing {
  productId: string;
  publicPrice: number;
  finalPrice: number;
  discountPercent: number;
  priceSheetId: string | null;
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
  pricing?: ProductPricing;
}

export interface ProductCategory {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  productIds: string[];
}
