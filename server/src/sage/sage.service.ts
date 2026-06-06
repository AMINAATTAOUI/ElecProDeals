import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ProductEntity } from '../database/entities/product.entity';
import type { Invoice, Quote } from '../types/invoice.types';

/**
 * SageService — Couche abstraction obligatoire pour tout accès Sage 100.
 * Phase POC : produits stockés en PostgreSQL (seed).
 *             Devis et factures : données mockées (structures JSON exactes attendues).
 * Phase production : remplacer uniquement l'implémentation interne.
 * Calcul des prix : délégué à PricingService.
 */
@Injectable()
export class SageService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepo: Repository<ProductEntity>,
  ) {}

  // ─── Catalogue ────────────────────────────────────────────────────────────

  async getProducts(): Promise<ProductEntity[]> {
    return this.productsRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
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

  // ─── Factures (mock POC) ──────────────────────────────────────────────────

  getInvoicesByClient(clientId: string): Invoice[] {
    const base = new Date();
    const daysAgo = (n: number) => {
      const d = new Date(base);
      d.setDate(d.getDate() - n);
      return d;
    };
    const daysLater = (n: number) => {
      const d = new Date(base);
      d.setDate(d.getDate() + n);
      return d;
    };

    return [
      {
        id: `sage-inv-${clientId.slice(0, 8)}-001`,
        sageRef: 'FAC-2026-0031',
        clientId,
        orderId: null,
        amount: 342.8,
        vatAmount: 57.13,
        status: 'unpaid',
        dueDate: daysLater(15),
        issuedAt: daysAgo(5),
        pdfUrl: null,
      },
      {
        id: `sage-inv-${clientId.slice(0, 8)}-002`,
        sageRef: 'FAC-2026-0027',
        clientId,
        orderId: null,
        amount: 128.5,
        vatAmount: 21.42,
        status: 'paid',
        dueDate: daysAgo(10),
        issuedAt: daysAgo(40),
        pdfUrl: null,
      },
      {
        id: `sage-inv-${clientId.slice(0, 8)}-003`,
        sageRef: 'FAC-2026-0019',
        clientId,
        orderId: null,
        amount: 876.0,
        vatAmount: 146.0,
        status: 'overdue',
        dueDate: daysAgo(5),
        issuedAt: daysAgo(35),
        pdfUrl: null,
      },
    ];
  }

  // ─── Devis (mock POC) ─────────────────────────────────────────────────────

  getQuotesByClient(clientId: string): Quote[] {
    const base = new Date();
    const daysAgo = (n: number) => {
      const d = new Date(base);
      d.setDate(d.getDate() - n);
      return d;
    };
    const daysLater = (n: number) => {
      const d = new Date(base);
      d.setDate(d.getDate() + n);
      return d;
    };

    return [
      {
        id: `sage-quo-${clientId.slice(0, 8)}-001`,
        sageRef: 'DEV-2026-0018',
        clientId,
        items: [
          {
            productRef: 'LEG-051234',
            productName: 'Tableau électrique 13 modules',
            quantity: 2,
            unitPrice: 89.5,
          },
          {
            productRef: 'SCH-078123',
            productName: 'Disjoncteur différentiel 40A',
            quantity: 4,
            unitPrice: 265.5,
          },
        ],
        totalHT: 1240.0,
        status: 'accepted',
        validUntil: daysLater(20),
        issuedAt: daysAgo(10),
        pdfUrl: null,
      },
      {
        id: `sage-quo-${clientId.slice(0, 8)}-002`,
        sageRef: 'DEV-2026-0015',
        clientId,
        items: [
          {
            productRef: 'PHI-045678',
            productName: 'Câble HO7RNF 3G2,5mm²',
            quantity: 100,
            unitPrice: 5.8,
          },
        ],
        totalHT: 580.0,
        status: 'pending',
        validUntil: daysLater(7),
        issuedAt: daysAgo(23),
        pdfUrl: null,
      },
      {
        id: `sage-quo-${clientId.slice(0, 8)}-003`,
        sageRef: 'DEV-2026-0011',
        clientId,
        items: [
          {
            productRef: 'HAG-089012',
            productName: 'Interrupteur différentiel 63A type AC',
            quantity: 1,
            unitPrice: 312.0,
          },
        ],
        totalHT: 312.0,
        status: 'expired',
        validUntil: daysAgo(3),
        issuedAt: daysAgo(33),
        pdfUrl: null,
      },
    ];
  }
}
