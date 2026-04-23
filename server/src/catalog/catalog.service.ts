import { Injectable } from '@nestjs/common';
import { SageService } from '../sage/sage.service';
import { ProductEntity } from '../database/entities/product.entity';
import type { ComputedPrice } from '../types/pricing.types';
import type { CustomerType } from '../types/user.types';

type ProductWithPricing = ProductEntity & { pricing?: ComputedPrice };

@Injectable()
export class CatalogService {
  constructor(private readonly sageService: SageService) {}

  async getProducts(customerType?: CustomerType): Promise<ProductWithPricing[]> {
    const products = await this.sageService.getProducts();

    if (!customerType) {
      return products;
    }

    return products.map((product) => ({
      ...product,
      pricing: this.sageService.computePrice(product, customerType),
    }));
  }

  async getProductById(
    id: string,
    customerType?: CustomerType,
  ): Promise<ProductWithPricing | null> {
    const product = await this.sageService.getProductById(id);

    if (!product) {
      return null;
    }

    if (!customerType) {
      return product;
    }

    return {
      ...product,
      pricing: this.sageService.computePrice(product, customerType),
    };
  }

  async searchProducts(
    query: string,
    customerType?: CustomerType,
  ): Promise<ProductWithPricing[]> {
    const products = await this.sageService.searchProducts(query);

    if (!customerType) {
      return products;
    }

    return products.map((product) => ({
      ...product,
      pricing: this.sageService.computePrice(product, customerType),
    }));
  }
}
