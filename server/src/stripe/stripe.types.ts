// Types Stripe — Phase 2 (CB activé)
// Phase 1 : module mocké, interfaces définies, implémentation retourne des données simulées

export type PaymentIntentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'canceled'
  | 'failed';

export type RefundStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

export interface CreatePaymentIntentDto {
  orderId: string;
  amountCents: number; // montant en centimes (ex: 15000 = 150,00€)
  currency: 'eur';
  customerId: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  status: PaymentIntentStatus;
  amountCents: number;
  currency: 'eur';
  orderId: string;
  customerId: string;
  createdAt: string;
}

export interface ConfirmPaymentResult {
  success: boolean;
  paymentIntentId: string;
  status: PaymentIntentStatus;
}

export interface RefundDto {
  paymentIntentId: string;
  amountCents?: number; // partiel si défini, total sinon
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

export interface Refund {
  id: string;
  paymentIntentId: string;
  amountCents: number;
  status: RefundStatus;
  reason: string;
  createdAt: string;
}
