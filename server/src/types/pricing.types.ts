import type { CustomerType } from './user.types';

export type PricingRuleOperator = 'multiply' | 'add' | 'subtract' | 'fixed';

export interface PricingRule {
  id: string;
  operator: PricingRuleOperator;
  value: number;
  description?: string | null;
  sortOrder: number;
}

export interface PriceSheet {
  id: string;
  name: string;
  rules: PricingRule[];
  /** null = feuille individuelle */
  appliesTo: CustomerType | null;
  isActive: boolean;
}

export interface ComputedPrice {
  productId: string;
  publicPrice: number;
  finalPrice: number;
  priceSheetId: string | null;
  discountPercent: number;
}
