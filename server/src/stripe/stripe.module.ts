import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';

/**
 * StripeModule — isolé, exporté, prêt pour Phase 2
 * Importer dans OrdersModule quand le paiement CB sera activé.
 */
@Module({
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
