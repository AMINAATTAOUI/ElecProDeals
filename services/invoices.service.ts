import { api } from './api';
import type { Invoice, Quote } from '@/types/invoice.types';

export const invoicesService = {
  async getInvoices(): Promise<Invoice[]> {
    const { data } = await api.get<Invoice[]>('/invoices');
    return data;
  },

  async getQuotes(): Promise<Quote[]> {
    const { data } = await api.get<Quote[]>('/invoices/quotes');
    return data;
  },
};
