import type { CustomerType } from './user.types';

export type PricingRuleOperator = 'multiply' | 'add' | 'subtract' | 'fixed';

export interface PricingRule {
  id: string;
  operator: PricingRuleOperator;
  value: number;
  description?: string;
}

export interface PriceSheet {
  id: string;
  name: string;
  rules: PricingRule[];
  /** Applies to all clients of this customer type */
  appliesTo: CustomerType;
  /** Optional overrides for specific client IDs */
  clientOverrides?: string[];
  isActive: boolean;
}

export interface ComputedPrice {
  productId: string;
  publicPrice: number;
  finalPrice: number;
  priceSheetId: string | null;
  discountPercent: number;
}

