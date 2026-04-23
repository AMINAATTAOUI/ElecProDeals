import type { CustomerType } from './user.types';

export type PricingRuleOperator = 'multiply' | 'add_percent' | 'fixed';

export interface PricingRule {
  operator: PricingRuleOperator;
  value: number;
}

export interface PricingSheet {
  id: string;
  name: string;
  rules: PricingRule[];
  applicableCustomerTypes: CustomerType[];
  applicableClientIds: string[];
}

export interface ClientPrice {
  productId: string;
  computedPrice: number;
  basePrice: number;
  discountPercent: number;
}
