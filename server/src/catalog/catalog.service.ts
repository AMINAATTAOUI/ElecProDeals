import { Injectable } from '@nestjs/common';
import { SageService } from '../sage/sage.service';
import type { Product } from '../types/product.types';
import type { ComputedPrice } from '../types/pricing.types';
import type { CustomerType } from '../types/user.types';

@Injectable()
export class CatalogService {
  constructor(private readonly sageService: SageService) {}

  getProducts(customerType?: CustomerType): Array<Product & { pricing?: ComputedPrice }> {
    const products = this.sageService.getProducts();

    if (!customerType) {
      return products;
    }

    return products.map((product) => ({
      ...product,
      pricing: this.sageService.computePrice(product, customerType),
    }));
  }

  getProductById(
    id: string,
    customerType?: CustomerType,
  ): (Product & { pricing?: ComputedPrice }) | undefined {
    const product = this.sageService.getProductById(id);

    if (!product) {
      return undefined;
    }

    if (!customerType) {
      return product;
    }

    return {
      ...product,
      pricing: this.sageService.computePrice(product, customerType),
    };
  }

  searchProducts(
    query: string,
    customerType?: CustomerType,
  ): Array<Product & { pricing?: ComputedPrice }> {
    const products = this.sageService.searchProducts(query);

    if (!customerType) {
      return products;
    }

    return products.map((product) => ({
      ...product,
      pricing: this.sageService.computePrice(product, customerType),
    }));
  }
}
