import { fetcher } from '../fetcher';
import type { ApiOrder, CreateOrderRequest } from '../../../types/api';

export const orderApi = {
  async create(data: CreateOrderRequest): Promise<ApiOrder> {
    return fetcher<ApiOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMy(signal?: AbortSignal): Promise<ApiOrder[]> {
    return fetcher<ApiOrder[]>('/orders/me', { signal });
  },

  async getById(orderId: string, signal?: AbortSignal): Promise<ApiOrder> {
    return fetcher<ApiOrder>(`/orders/${orderId}`, { signal });
  },

  async requestReturn(orderId: string, reason?: string): Promise<ApiOrder> {
    return fetcher<ApiOrder>(`/orders/${orderId}/return`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};
