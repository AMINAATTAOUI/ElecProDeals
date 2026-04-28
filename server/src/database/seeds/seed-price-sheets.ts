import { DataSource } from 'typeorm';
import { PriceSheetEntity } from '../entities/price-sheet.entity';
import { PricingRuleEntity } from '../entities/pricing-rule.entity';

/**
 * Seed initial des 3 feuilles de prix B2B (CDC §3.2).
 * Idempotent : vérifie l'existence avant insertion.
 */
export async function seedPriceSheets(dataSource: DataSource): Promise<void> {
  const sheetsRepo = dataSource.getRepository(PriceSheetEntity);
  const rulesRepo = dataSource.getRepository(PricingRuleEntity);

  const existing = await sheetsRepo.count();
  if (existing > 0) return;

  const sheets: Array<{
    name: string;
    appliesTo: 'artisan' | 'large_installer' | 'wholesaler';
    rule: { operator: 'multiply'; value: number; description: string };
  }> = [
    {
      name: 'Artisans & Installateurs Standard',
      appliesTo: 'artisan',
      rule: { operator: 'multiply', value: 0.82, description: 'Remise 18% sur prix public' },
    },
    {
      name: 'Gros Installateurs',
      appliesTo: 'large_installer',
      rule: { operator: 'multiply', value: 0.72, description: 'Remise 28% sur prix public' },
    },
    {
      name: 'Grossistes',
      appliesTo: 'wholesaler',
      rule: { operator: 'multiply', value: 0.60, description: 'Remise 40% sur prix public' },
    },
  ];

  for (const def of sheets) {
    const sheet = sheetsRepo.create({
      name: def.name,
      appliesTo: def.appliesTo,
      isActive: true,
    });
    const savedSheet = await sheetsRepo.save(sheet);

    const rule = rulesRepo.create({
      operator: def.rule.operator,
      value: def.rule.value,
      description: def.rule.description,
      sortOrder: 0,
      priceSheet: savedSheet,
    });
    await rulesRepo.save(rule);
  }
}
