import { Injectable } from '@nestjs/common';
import { SageService } from '../sage/sage.service';
import type { Invoice, Quote } from '../types/invoice.types';

@Injectable()
export class InvoicesService {
  constructor(private readonly sageService: SageService) {}

  async getInvoices(clientId: string): Promise<Invoice[]> {
    return Promise.resolve(this.sageService.getInvoicesByClient(clientId));
  }

  async getQuotes(clientId: string): Promise<Quote[]> {
    return Promise.resolve(this.sageService.getQuotesByClient(clientId));
  }
}
