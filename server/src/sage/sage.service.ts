import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ProductEntity } from '../database/entities/product.entity';
import type { PriceSheet, ComputedPrice } from '../types/pricing.types';
import type { CustomerType } from '../types/user.types';

/**
 * SageService — Couche abstraction obligatoire pour tout accès Sage 100.
 * Phase POC : produits stockes en PostgreSQL (seed), feuilles de prix en memoire.
 * Phase production : remplacer uniquement l implementation interne.
 */
@Injectable()
export class SageService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepo: Repository<ProductEntity>,
  ) {}

  private readonly PRICE_SHEETS: PriceSheet[] = [
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

  async getProducts(): Promise<ProductEntity[]> {
    return this.productsRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async getProductById(id: string): Promise<ProductEntity | null> {
    return this.productsRepo.findOne({ where: { id, isActive: true } });
  }

  async searchProducts(query: string): Promise<ProductEntity[]> {
    return this.productsRepo.find({
      where: [
        { name: ILike(`%${query}%`), isActive: true },
        { sageRef: ILike(`%${query}%`), isActive: true },
        { category: ILike(`%${query}%`), isActive: true },
      ],
      order: { name: 'ASC' },
    });
  }

  getPriceSheetForCustomerType(customerType: CustomerType): PriceSheet | undefined {
    return this.PRICE_SHEETS.find((s) => s.appliesTo === customerType && s.isActive);
  }

  computePrice(product: ProductEntity, customerType: CustomerType): ComputedPrice {
    const sheet = this.getPriceSheetForCustomerType(customerType);

    if (!sheet) {
      return {
        productId: product.id,
        publicPrice: Number(product.publicPrice),
        finalPrice: Number(product.publicPrice),
        discountPercent: 0,
        priceSheetId: null,
      };
    }

    let finalPrice = Number(product.publicPrice);
    for (const rule of sheet.rules) {
      if (rule.operator === 'multiply') {
        finalPrice = finalPrice * rule.value;
      } else if (rule.operator === 'subtract') {
        finalPrice = finalPrice - rule.value;
      } else if (rule.operator === 'fixed') {
        finalPrice = rule.value;
      }
    }

    const discountPercent = Math.round(
      ((Number(product.publicPrice) - finalPrice) / Number(product.publicPrice)) * 100,
    );

    return {
      productId: product.id,
      publicPrice: Number(product.publicPrice),
      finalPrice: Math.round(finalPrice * 100) / 100,
      discountPercent,
      priceSheetId: sheet.id,
    };
  }
}
