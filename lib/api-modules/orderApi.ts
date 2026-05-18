import { fetcher } from '../fetcher';
import type { ApiOrder, CreateOrderRequest } from '../../types/api';

export const orderApi = {
  async create(data: CreateOrderRequest): Promise<ApiOrder> {
    return fetcher<ApiOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMy(): Promise<ApiOrder[]> {
    return fetcher<ApiOrder[]>('/orders/me');
  },

  async getById(orderId: string): Promise<ApiOrder> {
    return fetcher<ApiOrder>(`/orders/${orderId}`);
  },

  async requestReturn(orderId: string, reason?: string): Promise<ApiOrder> {
    return fetcher<ApiOrder>(`/orders/${orderId}/return`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};
