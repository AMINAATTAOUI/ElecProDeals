export type StockStatus = 'available' | 'out_of_stock' | 'on_order';

export interface Product {
  id: string;
  reference: string;
  name: string;
  description: string;
  publicPrice: number;
  stockStatus: StockStatus;
  estimatedDeliveryDays: number | null;
  categoryId: string;
  imageUrl: string | null;
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
