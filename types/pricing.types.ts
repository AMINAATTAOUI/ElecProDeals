import type { CustomerType } from './user.types';

export type PricingRuleOperator = 'multiply' | 'add' | 'subtract' | 'fixed';

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
}

/** Résultat du moteur de calcul retourné par le backend dans chaque produit */
export interface ComputedPrice {
  productId: string;
  publicPrice: number;
  finalPrice: number;
  discountPercent: number;
  priceSheetId: string | null;
}
