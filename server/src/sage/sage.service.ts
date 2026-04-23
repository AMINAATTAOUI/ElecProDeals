import { Injectable } from '@nestjs/common';
import type { Product, StockStatus } from '../types/product.types';
import type { PriceSheet, ComputedPrice } from '../types/pricing.types';
import type { CustomerType } from '../types/user.types';

/**
 * SageService — Couche d'abstraction obligatoire pour tout accès aux données Sage 100.
 * Phase POC : retourne des données mockées avec structures JSON identiques à l'API réelle.
 * Phase production : remplacer uniquement l'implémentation interne sans changer les interfaces.
 */
@Injectable()
export class SageService {
  private readonly MOCK_PRODUCTS: Product[] = [
    {
      id: 'prod-001',
      sageRef: 'DIS-63A-C',
      name: 'Disjoncteur 63A courbe C',
      description: 'Disjoncteur unipolaire + neutre 63A courbe C, pouvoir de coupure 6kA',
      category: 'Protection électrique',
      publicPrice: 42.50,
      unit: 'pièce',
      stockStatus: 'available',
      estimatedDeliveryDays: 1,
      isActive: true,
    },
    {
      id: 'prod-002',
      sageRef: 'DIS-20A-B',
      name: 'Disjoncteur 20A courbe B',
      description: 'Disjoncteur bipolaire 20A courbe B, pour circuits éclairage',
      category: 'Protection électrique',
      publicPrice: 28.90,
      unit: 'pièce',
      stockStatus: 'available',
      estimatedDeliveryDays: 1,
      isActive: true,
    },
    {
      id: 'prod-003',
      sageRef: 'DDR-40A-30MA',
      name: 'Interrupteur différentiel 40A 30mA Type A',
      description: 'IDR 40A 30mA type A, protection personnes et matériels',
      category: 'Protection électrique',
      publicPrice: 67.80,
      unit: 'pièce',
      stockStatus: 'available',
      estimatedDeliveryDays: 2,
      isActive: true,
    },
    {
      id: 'prod-004',
      sageRef: 'CPT-LINKY-MONO',
      name: 'Compteur Linky monophasé',
      description: 'Compteur communicant Linky monophasé, agréé Enedis',
      category: 'Comptage',
      publicPrice: 189.00,
      unit: 'pièce',
      stockStatus: 'on_order',
      estimatedDeliveryDays: 14,
      isActive: true,
    },
    {
      id: 'prod-005',
      sageRef: 'CAB-H07VU-2.5',
      name: 'Câble H07V-U 2,5mm² rouleau 100m',
      description: 'Fil rigide H07V-U section 2,5mm², rouleau de 100 mètres, rouge',
      category: 'Câblage',
      publicPrice: 54.20,
      unit: 'rouleau',
      stockStatus: 'available',
      estimatedDeliveryDays: 1,
      isActive: true,
    },
    {
      id: 'prod-006',
      sageRef: 'CAB-H07VR-6',
      name: 'Câble H07V-R 6mm² rouleau 100m',
      description: 'Fil souple H07V-R section 6mm², rouleau de 100 mètres, vert/jaune',
      category: 'Câblage',
      publicPrice: 98.50,
      unit: 'rouleau',
      stockStatus: 'available',
      estimatedDeliveryDays: 1,
      isActive: true,
    },
    {
      id: 'prod-007',
      sageRef: 'GON-IP65-200',
      name: 'Goulotte IP65 200mm',
      description: 'Goulotte de câblage IP65, section 200mm, longueur 2m, gris RAL 7035',
      category: 'Cheminement',
      publicPrice: 18.70,
      unit: 'mètre',
      stockStatus: 'available',
      estimatedDeliveryDays: 3,
      isActive: true,
    },
    {
      id: 'prod-008',
      sageRef: 'TAB-ABB-4G25',
      name: 'Tableau électrique 4 rangées 25 modules',
      description: 'Coffret de distribution 4 rangées 25 modules, avec porte vitrée',
      category: 'Tableaux électriques',
      publicPrice: 245.00,
      unit: 'pièce',
      stockStatus: 'available',
      estimatedDeliveryDays: 2,
      isActive: true,
    },
    {
      id: 'prod-009',
      sageRef: 'PRJ-LED-50W',
      name: 'Projecteur LED 50W chantier',
      description: 'Projecteur LED 50W 4000K, IP65, avec portée réglable, idéal chantier',
      category: 'Éclairage',
      publicPrice: 89.90,
      unit: 'pièce',
      stockStatus: 'available',
      estimatedDeliveryDays: 1,
      isActive: true,
    },
    {
      id: 'prod-010',
      sageRef: 'PRI-16A-2P+T',
      name: 'Prise 16A 2P+T étanche IP44',
      description: 'Prise de courant 16A 2P+T encastrable étanche IP44, blanc',
      category: 'Appareillage',
      publicPrice: 12.40,
      unit: 'pièce',
      stockStatus: 'available',
      estimatedDeliveryDays: 1,
      isActive: true,
    },
    {
      id: 'prod-011',
      sageRef: 'INT-VA-VT-10A',
      name: 'Interrupteur va-et-vient 10A',
      description: 'Interrupteur va-et-vient 10A 250V, finition blanc satiné',
      category: 'Appareillage',
      publicPrice: 8.90,
      unit: 'pièce',
      stockStatus: 'available',
      estimatedDeliveryDays: 1,
      isActive: true,
    },
    {
      id: 'prod-012',
      sageRef: 'CHARG-VE-7KW',
      name: 'Borne de recharge VE 7kW',
      description: 'Wallbox monophasé 7kW Type 2, Wifi, avec câble 5m, norme IEC 61851',
      category: 'Mobilité électrique',
      publicPrice: 890.00,
      unit: 'pièce',
      stockStatus: 'out_of_stock',
      estimatedDeliveryDays: 21,
      isActive: true,
    },
    {
      id: 'prod-013',
      sageRef: 'CHARG-VE-22KW',
      name: 'Borne de recharge VE 22kW triphasé',
      description: 'Borne recharge triphasée 22kW Type 2, RFID, 4G, pour parking professionnel',
      category: 'Mobilité électrique',
      publicPrice: 1890.00,
      unit: 'pièce',
      stockStatus: 'on_order',
      estimatedDeliveryDays: 30,
      isActive: true,
    },
    {
      id: 'prod-014',
      sageRef: 'CAP-400V-10KVAR',
      name: 'Condensateur compensation 10 kVAR',
      description: 'Batterie de condensateurs 10 kVAR 400V, amélioration facteur de puissance',
      category: 'Compensateurs',
      publicPrice: 320.00,
      unit: 'pièce',
      stockStatus: 'available',
      estimatedDeliveryDays: 5,
      isActive: true,
    },
    {
      id: 'prod-015',
      sageRef: 'VFD-ABB-4KW',
      name: 'Variateur de fréquence 4kW',
      description: 'Variateur de vitesse ABB ACS310 4kW 400V triphasé, IP20',
      category: 'Automatisme',
      publicPrice: 480.00,
      unit: 'pièce',
      stockStatus: 'available',
      estimatedDeliveryDays: 7,
      isActive: true,
    },
    {
      id: 'prod-016',
      sageRef: 'TGBT-125A-4P',
      name: 'Interrupteur sectionneur 125A 4P',
      description: 'Sectionneur 125A 4 pôles en charge, coupure omnipolaire garantie',
      category: 'Protection électrique',
      publicPrice: 145.00,
      unit: 'pièce',
      stockStatus: 'available',
      estimatedDeliveryDays: 3,
      isActive: true,
    },
    {
      id: 'prod-017',
      sageRef: 'PARA-FOUDRE-T1T2',
      name: 'Parafoudre Type 1+2',
      description: 'Parafoudre combiné Type 1+2 pour installation triphasée, 25kA',
      category: 'Protection électrique',
      publicPrice: 210.00,
      unit: 'pièce',
      stockStatus: 'available',
      estimatedDeliveryDays: 4,
      isActive: true,
    },
    {
      id: 'prod-018',
      sageRef: 'SOUS-REPARTITEUR-63A',
      name: 'Sous-répartiteur 63A 18 modules',
      description: 'Petit tableau secondaire 63A 1 rangée 18 modules, plastique gris',
      category: 'Tableaux électriques',
      publicPrice: 72.00,
      unit: 'pièce',
      stockStatus: 'available',
      estimatedDeliveryDays: 1,
      isActive: true,
    },
    {
      id: 'prod-019',
      sageRef: 'TUBE-LED-T8-18W',
      name: 'Tube fluorescent LED T8 18W 1200mm',
      description: 'Tube LED T8 18W 1200mm 4000K, compatible ballast électronique, 2000lm',
      category: 'Éclairage',
      publicPrice: 14.90,
      unit: 'pièce',
      stockStatus: 'available',
      estimatedDeliveryDays: 2,
      isActive: true,
    },
    {
      id: 'prod-020',
      sageRef: 'DETECT-MVMT-IR-180',
      name: 'Détecteur de mouvement infrarouge 180°',
      description: 'Détecteur de présence PIR 180° IP44, portée 12m, pour extérieur',
      category: 'Domotique',
      publicPrice: 38.50,
      unit: 'pièce',
      stockStatus: 'available',
      estimatedDeliveryDays: 1,
      isActive: true,
    },
  ];

  private readonly MOCK_PRICE_SHEETS: PriceSheet[] = [
    {
      id: 'sheet-artisan-standard',
      name: 'Artisans & Installateurs Standard',
      appliesTo: 'artisan',
      rules: [
        {
          id: 'rule-artisan-default',
          operator: 'multiply',
          value: 0.82,
          description: 'Remise 18% sur prix public',
        },
      ],
      isActive: true,
    },
    {
      id: 'sheet-gros-installateur',
      name: 'Gros Installateurs',
      appliesTo: 'large_installer',
      rules: [
        {
          id: 'rule-gros-installateur-default',
          operator: 'multiply',
          value: 0.72,
          description: 'Remise 28% sur prix public',
        },
      ],
      isActive: true,
    },
    {
      id: 'sheet-grossiste',
      name: 'Grossistes',
      appliesTo: 'wholesaler',
      rules: [
        {
          id: 'rule-grossiste-default',
          operator: 'multiply',
          value: 0.60,
          description: 'Remise 40% sur prix public',
        },
      ],
      isActive: true,
    },
  ];

  getProducts(): Product[] {
    return this.MOCK_PRODUCTS;
  }

  getProductById(id: string): Product | undefined {
    return this.MOCK_PRODUCTS.find((p) => p.id === id);
  }

  searchProducts(query: string): Product[] {
    const lower = query.toLowerCase();
    return this.MOCK_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.sageRef.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower),
    );
  }

  getPriceSheetForCustomerType(customerType: CustomerType): PriceSheet | undefined {
    return this.MOCK_PRICE_SHEETS.find((s) => s.appliesTo === customerType && s.isActive);
  }

  computePrice(product: Product, customerType: CustomerType): ComputedPrice {
    const sheet = this.getPriceSheetForCustomerType(customerType);

    if (!sheet) {
      return {
        productId: product.id,
        publicPrice: product.publicPrice,
        finalPrice: product.publicPrice,
        discountPercent: 0,
        priceSheetId: null,
      };
    }

    let finalPrice = product.publicPrice;
    for (const rule of sheet.rules) {
      if (rule.operator === 'multiply') {
        finalPrice = finalPrice * rule.value;
      } else if (rule.operator === 'subtract') {
        finalPrice = finalPrice - rule.value;
      } else if (rule.operator === 'fixed') {
        finalPrice = rule.value;
      }
    }

    const discountPercent = Math.round(((product.publicPrice - finalPrice) / product.publicPrice) * 100);

    return {
      productId: product.id,
      publicPrice: product.publicPrice,
      finalPrice: Math.round(finalPrice * 100) / 100,
      discountPercent,
      priceSheetId: sheet.id,
    };
  }
}
