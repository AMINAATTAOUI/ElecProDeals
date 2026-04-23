import { api } from './api';
import type { Order, CreateOrderDto } from '@/types/order.types';

export const ordersService = {
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const { data } = await api.post<Order>('/orders', dto);
    return data;
  },

  async getMyOrders(): Promise<Order[]> {
    const { data } = await api.get<Order[]>('/orders');
    return data;
  },

  async getOrderById(id: string): Promise<Order> {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  async cancelOrder(id: string): Promise<Order> {
    const { data } = await api.patch<Order>(`/orders/${id}/cancel`);
    return data;
  },
};
