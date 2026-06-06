import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceSheetEntity } from '../database/entities/price-sheet.entity';
import { PricingRuleEntity } from '../database/entities/pricing-rule.entity';
import { ProductEntity } from '../database/entities/product.entity';
import type { ComputedPrice } from '../types/pricing.types';
import type { CustomerType } from '../types/user.types';
import {
  CreatePriceSheetDto,
  UpdatePriceSheetDto,
} from './dto/create-price-sheet.dto';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PriceSheetEntity)
    private readonly sheetsRepo: Repository<PriceSheetEntity>,
    @InjectRepository(PricingRuleEntity)
    private readonly rulesRepo: Repository<PricingRuleEntity>,
  ) {}

  findAll(): Promise<PriceSheetEntity[]> {
    return this.sheetsRepo.find({ order: { createdAt: 'ASC' } });
  }

  findById(id: string): Promise<PriceSheetEntity | null> {
    return this.sheetsRepo.findOne({ where: { id } });
  }

  findByCustomerType(
    customerType: CustomerType,
  ): Promise<PriceSheetEntity | null> {
    return this.sheetsRepo.findOne({
      where: { appliesTo: customerType, isActive: true },
    });
  }

  async create(dto: CreatePriceSheetDto): Promise<PriceSheetEntity> {
    const sheet = this.sheetsRepo.create({
      name: dto.name,
      appliesTo: dto.appliesTo ?? null,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.sheetsRepo.save(sheet);

    if (dto.rules && dto.rules.length > 0) {
      const rules = dto.rules.map((r, i) =>
        this.rulesRepo.create({
          operator: r.operator,
          value: r.value,
          description: r.description ?? null,
          sortOrder: r.sortOrder ?? i,
          priceSheet: saved,
        }),
      );
      await this.rulesRepo.save(rules);
    }

    return this.sheetsRepo.findOneOrFail({ where: { id: saved.id } });
  }

  async update(
    id: string,
    dto: UpdatePriceSheetDto,
  ): Promise<PriceSheetEntity> {
    const sheet = await this.sheetsRepo.findOne({ where: { id } });
    if (!sheet) throw new NotFoundException(`PriceSheet ${id} not found`);

    if (dto.name !== undefined) sheet.name = dto.name;
    if (dto.appliesTo !== undefined) sheet.appliesTo = dto.appliesTo ?? null;
    if (dto.isActive !== undefined) sheet.isActive = dto.isActive;
    await this.sheetsRepo.save(sheet);

    if (dto.rules !== undefined) {
      await this.rulesRepo.delete({ priceSheet: { id } });
      if (dto.rules.length > 0) {
        const rules = dto.rules.map((r, i) =>
          this.rulesRepo.create({
            operator: r.operator,
            value: r.value,
            description: r.description ?? null,
            sortOrder: r.sortOrder ?? i,
            priceSheet: sheet,
          }),
        );
        await this.rulesRepo.save(rules);
      }
    }

    return this.sheetsRepo.findOneOrFail({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    const sheet = await this.sheetsRepo.findOne({ where: { id } });
    if (!sheet) throw new NotFoundException(`PriceSheet ${id} not found`);
    await this.sheetsRepo.remove(sheet);
  }

  /**
   * Moteur de calcul — cœur métier feuilles de prix B2B.
   * Priorité : feuille individuelle (pricingSheetId) > feuille par customerType > prix public
   */
  async computePrice(
    product: ProductEntity,
    pricingSheetId: string | null | undefined,
    customerType?: CustomerType,
  ): Promise<ComputedPrice> {
    let sheet: PriceSheetEntity | null = null;

    // 1. Feuille individuelle du client (priorité max)
    if (pricingSheetId) {
      sheet = await this.sheetsRepo.findOne({
        where: { id: pricingSheetId, isActive: true },
      });
    }

    // 2. Fallback sur la feuille par customerType
    if (!sheet && customerType) {
      sheet = await this.sheetsRepo.findOne({
        where: { appliesTo: customerType, isActive: true },
      });
    }

    // 3. Aucune feuille → prix public
    if (!sheet || sheet.rules.length === 0) {
      return {
        productId: product.id,
        publicPrice: Number(product.publicPrice),
        finalPrice: Number(product.publicPrice),
        discountPercent: 0,
        priceSheetId: null,
      };
    }

    // 4. Appliquer les règles dans l'ordre
    const sortedRules = [...sheet.rules].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    let finalPrice = Number(product.publicPrice);
    for (const rule of sortedRules) {
      const val = Number(rule.value);
      if (rule.operator === 'multiply') {
        finalPrice = finalPrice * val;
      } else if (rule.operator === 'add') {
        finalPrice = finalPrice + val;
      } else if (rule.operator === 'subtract') {
        finalPrice = finalPrice - val;
      } else if (rule.operator === 'fixed') {
        finalPrice = val;
      }
    }

    finalPrice = Math.max(0, Math.round(finalPrice * 100) / 100);

    const publicPrice = Number(product.publicPrice);
    const discountPercent =
      publicPrice > 0
        ? Math.round(((publicPrice - finalPrice) / publicPrice) * 100)
        : 0;

    return {
      productId: product.id,
      publicPrice,
      finalPrice,
      discountPercent,
      priceSheetId: sheet.id,
    };
  }
}
