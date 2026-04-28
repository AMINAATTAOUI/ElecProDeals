import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ProductEntity } from '../database/entities/product.entity';

/**
 * SageService — Couche abstraction obligatoire pour tout accès Sage 100.
 * Phase POC : produits stockés en PostgreSQL (seed).
 * Phase production : remplacer uniquement l'implémentation interne.
 * Calcul des prix : délégué à PricingService.
 */
@Injectable()
export class SageService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepo: Repository<ProductEntity>,
  ) {}

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
}

