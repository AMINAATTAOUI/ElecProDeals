import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import type {
  CreatePaymentIntentDto,
  PaymentIntent,
  ConfirmPaymentResult,
  RefundDto,
  Refund,
} from './stripe.types';

/**
 * StripeService — Phase 1 : mock complet
 *
 * Retourne des données simulées avec les structures JSON exactes attendues de l'API Stripe.
 * Phase 2 : remplacer uniquement l'implémentation interne de chaque méthode
 * en appelant le SDK Stripe officiel — aucun autre fichier ne change.
 *
 * STRIPE_ENABLED=false → Phase 1 (mock)
 * STRIPE_ENABLED=true  → Phase 2 (réel) — lever NotImplementedException jusqu'à activation
 */
@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly isEnabled = process.env['STRIPE_ENABLED'] === 'true';

  createPaymentIntent(dto: CreatePaymentIntentDto): PaymentIntent {
    if (this.isEnabled) {
      throw new NotImplementedException('Stripe real integration not yet activated (Phase 2)');
    }

    this.logger.log(`[MOCK] createPaymentIntent orderId=${dto.orderId} amount=${dto.amountCents}cts`);

    return {
      id: `pi_mock_${Date.now()}`,
      clientSecret: `pi_mock_${Date.now()}_secret_mock`,
      status: 'requires_payment_method',
      amountCents: dto.amountCents,
      currency: 'eur',
      orderId: dto.orderId,
      customerId: dto.customerId,
      createdAt: new Date().toISOString(),
    };
  }

  confirmPayment(paymentIntentId: string): ConfirmPaymentResult {
    if (this.isEnabled) {
      throw new NotImplementedException('Stripe real integration not yet activated (Phase 2)');
    }

    this.logger.log(`[MOCK] confirmPayment piId=${paymentIntentId}`);

    return {
      success: true,
      paymentIntentId,
      status: 'succeeded',
    };
  }

  createRefund(dto: RefundDto): Refund {
    if (this.isEnabled) {
      throw new NotImplementedException('Stripe real integration not yet activated (Phase 2)');
    }

    this.logger.log(`[MOCK] createRefund piId=${dto.paymentIntentId}`);

    return {
      id: `re_mock_${Date.now()}`,
      paymentIntentId: dto.paymentIntentId,
      amountCents: dto.amountCents ?? 0,
      status: 'succeeded',
      reason: dto.reason ?? 'requested_by_customer',
      createdAt: new Date().toISOString(),
    };
  }
}
