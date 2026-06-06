import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PricingService } from '../pricing.service';
import { PriceSheetEntity } from '../../database/entities/price-sheet.entity';
import { PricingRuleEntity } from '../../database/entities/pricing-rule.entity';
import { ProductEntity } from '../../database/entities/product.entity';

/** Fabrique un ProductEntity minimal pour les tests */
function makeProduct(publicPrice: number): ProductEntity {
  return {
    id: 'prod-1',
    publicPrice: publicPrice,
  } as ProductEntity;
}

/** Fabrique une PriceSheetEntity avec règles */
function makeSheet(
  id: string,
  appliesTo: PriceSheetEntity['appliesTo'],
  rules: Partial<PricingRuleEntity>[],
): PriceSheetEntity {
  const sheet = new PriceSheetEntity();
  sheet.id = id;
  sheet.appliesTo = appliesTo;
  sheet.isActive = true;
  sheet.name = 'Test Sheet';
  sheet.rules = rules.map((r, i) => ({
    id: `rule-${i}`,
    operator: r.operator ?? 'multiply',
    value: r.value ?? 1,
    description: r.description ?? null,
    sortOrder: r.sortOrder ?? i,
    priceSheet: sheet,
  }));
  return sheet;
}

describe('PricingService — moteur de calcul', () => {
  let service: PricingService;
  let sheetsRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    sheetsRepo = { findOne: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        PricingService,
        { provide: getRepositoryToken(PriceSheetEntity), useValue: sheetsRepo },
        { provide: getRepositoryToken(PricingRuleEntity), useValue: {} },
      ],
    }).compile();

    service = module.get(PricingService);
  });

  describe('computePrice — aucune feuille', () => {
    it('retourne le prix public sans remise', async () => {
      sheetsRepo.findOne.mockResolvedValue(null);

      const result = await service.computePrice(
        makeProduct(100),
        null,
        undefined,
      );

      expect(result.finalPrice).toBe(100);
      expect(result.discountPercent).toBe(0);
      expect(result.priceSheetId).toBeNull();
    });
  });

  describe('computePrice — règle multiply', () => {
    it('applique un coefficient de remise artisan 18%', async () => {
      const sheet = makeSheet('s1', 'artisan', [
        { operator: 'multiply', value: 0.82 },
      ]);
      sheetsRepo.findOne.mockResolvedValue(sheet);

      const result = await service.computePrice(
        makeProduct(100),
        null,
        'artisan',
      );

      expect(result.finalPrice).toBe(82);
      expect(result.discountPercent).toBe(18);
      expect(result.priceSheetId).toBe('s1');
    });

    it('applique remise gros installateur 28%', async () => {
      const sheet = makeSheet('s2', 'large_installer', [
        { operator: 'multiply', value: 0.72 },
      ]);
      sheetsRepo.findOne.mockResolvedValue(sheet);

      const result = await service.computePrice(
        makeProduct(200),
        null,
        'large_installer',
      );

      expect(result.finalPrice).toBe(144);
      expect(result.discountPercent).toBe(28);
    });

    it('applique remise grossiste 40%', async () => {
      const sheet = makeSheet('s3', 'wholesaler', [
        { operator: 'multiply', value: 0.6 },
      ]);
      sheetsRepo.findOne.mockResolvedValue(sheet);

      const result = await service.computePrice(
        makeProduct(50),
        null,
        'wholesaler',
      );

      expect(result.finalPrice).toBe(30);
      expect(result.discountPercent).toBe(40);
    });
  });

  describe('computePrice — règle fixed', () => {
    it('fixe un prix absolu indépendamment du prix public', async () => {
      const sheet = makeSheet('s4', null, [{ operator: 'fixed', value: 75 }]);
      sheetsRepo.findOne.mockResolvedValue(sheet);

      const result = await service.computePrice(
        makeProduct(120),
        's4',
        undefined,
      );

      expect(result.finalPrice).toBe(75);
      expect(result.publicPrice).toBe(120);
    });
  });

  describe('computePrice — règle add / subtract', () => {
    it('ajoute un montant fixe au prix', async () => {
      const sheet = makeSheet('s5', null, [{ operator: 'add', value: 10 }]);
      sheetsRepo.findOne.mockResolvedValue(sheet);

      const result = await service.computePrice(
        makeProduct(100),
        's5',
        undefined,
      );

      expect(result.finalPrice).toBe(110);
    });

    it('soustrait un montant fixe du prix', async () => {
      const sheet = makeSheet('s6', null, [
        { operator: 'subtract', value: 15 },
      ]);
      sheetsRepo.findOne.mockResolvedValue(sheet);

      const result = await service.computePrice(
        makeProduct(100),
        's6',
        undefined,
      );

      expect(result.finalPrice).toBe(85);
      expect(result.discountPercent).toBe(15);
    });
  });

  describe('computePrice — chaîne multi-règles', () => {
    it("applique les règles dans l'ordre sortOrder", async () => {
      // Prix public: 100
      // Règle 0 (sortOrder 0): multiply 0.9 → 90
      // Règle 1 (sortOrder 1): subtract 5  → 85
      const sheet = makeSheet('s7', null, [
        { operator: 'multiply', value: 0.9, sortOrder: 0 },
        { operator: 'subtract', value: 5, sortOrder: 1 },
      ]);
      sheetsRepo.findOne.mockResolvedValue(sheet);

      const result = await service.computePrice(
        makeProduct(100),
        's7',
        undefined,
      );

      expect(result.finalPrice).toBe(85);
    });

    it('respecte le tri sortOrder même si désordonné', async () => {
      // Règle sortOrder 1: subtract 10 → exécutée en SECOND
      // Règle sortOrder 0: multiply 0.8 → exécutée en PREMIER
      // 100 * 0.8 = 80 → 80 - 10 = 70
      const sheet = makeSheet('s8', null, [
        { operator: 'subtract', value: 10, sortOrder: 1 },
        { operator: 'multiply', value: 0.8, sortOrder: 0 },
      ]);
      sheetsRepo.findOne.mockResolvedValue(sheet);

      const result = await service.computePrice(
        makeProduct(100),
        's8',
        undefined,
      );

      expect(result.finalPrice).toBe(70);
    });
  });

  describe('computePrice — priorité feuille individuelle', () => {
    it('utilise la feuille individuelle plutôt que celle par customerType', async () => {
      const individualSheet = makeSheet('individual', null, [
        { operator: 'multiply', value: 0.5 },
      ]);
      const typeSheet = makeSheet('type-sheet', 'artisan', [
        { operator: 'multiply', value: 0.82 },
      ]);

      // Premier appel findOne (par ID) → feuille individuelle
      sheetsRepo.findOne.mockResolvedValueOnce(individualSheet);
      // Deuxième appel ne devrait pas être fait
      sheetsRepo.findOne.mockResolvedValueOnce(typeSheet);

      const result = await service.computePrice(
        makeProduct(100),
        'individual',
        'artisan',
      );

      expect(result.finalPrice).toBe(50);
      expect(result.priceSheetId).toBe('individual');
      // Vérifier que le fallback n'a pas été utilisé
      expect(sheetsRepo.findOne).toHaveBeenCalledTimes(1);
    });

    it('fallback sur feuille par customerType si feuille individuelle inactive/introuvable', async () => {
      const typeSheet = makeSheet('type-sheet', 'artisan', [
        { operator: 'multiply', value: 0.82 },
      ]);

      // Premier appel (par ID) → null
      sheetsRepo.findOne.mockResolvedValueOnce(null);
      // Deuxième appel (par customerType) → feuille artisan
      sheetsRepo.findOne.mockResolvedValueOnce(typeSheet);

      const result = await service.computePrice(
        makeProduct(100),
        'unknown-id',
        'artisan',
      );

      expect(result.finalPrice).toBe(82);
      expect(result.priceSheetId).toBe('type-sheet');
    });
  });

  describe('computePrice — edge cases', () => {
    it('ne produit pas un prix négatif', async () => {
      const sheet = makeSheet('s-neg', null, [
        { operator: 'subtract', value: 9999 },
      ]);
      sheetsRepo.findOne.mockResolvedValue(sheet);

      const result = await service.computePrice(
        makeProduct(10),
        's-neg',
        undefined,
      );

      expect(result.finalPrice).toBe(0);
    });

    it('arrondit à 2 décimales', async () => {
      const sheet = makeSheet('s-round', null, [
        { operator: 'multiply', value: 1 / 3 },
      ]);
      sheetsRepo.findOne.mockResolvedValue(sheet);

      const result = await service.computePrice(
        makeProduct(10),
        's-round',
        undefined,
      );

      expect(result.finalPrice).toBe(3.33);
    });
  });
});
