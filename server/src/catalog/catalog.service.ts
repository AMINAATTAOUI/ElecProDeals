import { Injectable } from '@nestjs/common';
import { SageService } from '../sage/sage.service';
import { PricingService } from '../pricing/pricing.service';
import { ProductEntity } from '../database/entities/product.entity';
import type { ComputedPrice } from '../types/pricing.types';
import type { CustomerType } from '../types/user.types';

type ProductWithPricing = Omit<ProductEntity, 'publicPrice'> & {
  publicPrice: number;
  pricing?: ComputedPrice;
};

function normalizeProduct(
  p: ProductEntity,
): Omit<ProductEntity, 'publicPrice'> & { publicPrice: number } {
  return { ...p, publicPrice: Number(p.publicPrice) };
}

@Injectable()
export class CatalogService {
  constructor(
    private readonly sageService: SageService,
    private readonly pricingService: PricingService,
  ) {}

  async getProducts(
    pricingSheetId?: string | null,
    customerType?: CustomerType,
  ): Promise<ProductWithPricing[]> {
    const products = await this.sageService.getProducts();

    if (!pricingSheetId && !customerType) {
      return products.map(normalizeProduct);
    }

    return Promise.all(
      products.map(async (product) => ({
        ...normalizeProduct(product),
        pricing: await this.pricingService.computePrice(
          product,
          pricingSheetId,
          customerType,
        ),
      })),
    );
  }

  async getProductById(
    id: string,
    pricingSheetId?: string | null,
    customerType?: CustomerType,
  ): Promise<ProductWithPricing | null> {
    const product = await this.sageService.getProductById(id);

    if (!product) return null;

    if (!pricingSheetId && !customerType) {
      return normalizeProduct(product);
    }

    return {
      ...normalizeProduct(product),
      pricing: await this.pricingService.computePrice(
        product,
        pricingSheetId,
        customerType,
      ),
    };
  }

  async searchProducts(
    query: string,
    pricingSheetId?: string | null,
    customerType?: CustomerType,
  ): Promise<ProductWithPricing[]> {
    const products = await this.sageService.searchProducts(query);

    if (!pricingSheetId && !customerType) {
      return products.map(normalizeProduct);
    }

    return Promise.all(
      products.map(async (product) => ({
        ...normalizeProduct(product),
        pricing: await this.pricingService.computePrice(
          product,
          pricingSheetId,
          customerType,
        ),
      })),
    );
  }
}
