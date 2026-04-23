import { api } from './api';
import type { Product } from '@/types/product.types';

export const catalogService = {
  async getProducts(search?: string): Promise<Product[]> {
    const params = search ? { q: search } : undefined;
    const { data } = await api.get<Product[]>('/catalog/products', { params });
    return data;
  },

  async getProductById(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/catalog/products/${id}`);
    return data;
  },
};
