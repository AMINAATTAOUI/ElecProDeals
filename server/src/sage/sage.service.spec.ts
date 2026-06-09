import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { SageService } from './sage.service';
import { ProductEntity } from '../database/entities/product.entity';

const CLIENT_ID = 'client-uuid-abcdef';

const mockProductsRepo = {
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
};

describe('SageService', () => {
  let service: SageService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SageService,
        { provide: getRepositoryToken(ProductEntity), useValue: mockProductsRepo },
      ],
    }).compile();

    service = module.get(SageService);
  });

  describe('getInvoicesByClient', () => {
    it('returns 3 invoices for any clientId', () => {
      const invoices = service.getInvoicesByClient(CLIENT_ID);
      expect(invoices).toHaveLength(3);
    });

    it('every invoice has required fields conforming to Invoice interface', () => {
      const invoices = service.getInvoicesByClient(CLIENT_ID);
      for (const inv of invoices) {
        expect(typeof inv.id).toBe('string');
        expect(typeof inv.sageRef).toBe('string');
        expect(inv.clientId).toBe(CLIENT_ID);
        expect(typeof inv.amount).toBe('number');
        expect(typeof inv.vatAmount).toBe('number');
        expect(['paid', 'unpaid', 'overdue']).toContain(inv.status);
        expect(inv.dueDate).toBeInstanceOf(Date);
        expect(inv.issuedAt).toBeInstanceOf(Date);
      }
    });

    it('includes all three statuses (paid, unpaid, overdue)', () => {
      const invoices = service.getInvoicesByClient(CLIENT_ID);
      const statuses = invoices.map((i) => i.status);
      expect(statuses).toContain('paid');
      expect(statuses).toContain('unpaid');
      expect(statuses).toContain('overdue');
    });
  });

  describe('getQuotesByClient', () => {
    it('returns 3 quotes for any clientId', () => {
      const quotes = service.getQuotesByClient(CLIENT_ID);
      expect(quotes).toHaveLength(3);
    });

    it('every quote has required fields conforming to Quote interface', () => {
      const quotes = service.getQuotesByClient(CLIENT_ID);
      for (const q of quotes) {
        expect(typeof q.id).toBe('string');
        expect(typeof q.sageRef).toBe('string');
        expect(q.clientId).toBe(CLIENT_ID);
        expect(Array.isArray(q.items)).toBe(true);
        expect(q.items.length).toBeGreaterThan(0);
        expect(typeof q.totalHT).toBe('number');
        expect(['pending', 'accepted', 'refused', 'expired']).toContain(q.status);
        expect(q.validUntil).toBeInstanceOf(Date);
        expect(q.issuedAt).toBeInstanceOf(Date);
      }
    });

    it('each quote item has required fields', () => {
      const quotes = service.getQuotesByClient(CLIENT_ID);
      for (const q of quotes) {
        for (const item of q.items) {
          expect(typeof item.productRef).toBe('string');
          expect(typeof item.productName).toBe('string');
          expect(typeof item.quantity).toBe('number');
          expect(typeof item.unitPrice).toBe('number');
        }
      }
    });
  });
});
