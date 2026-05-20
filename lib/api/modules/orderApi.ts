import { fetcher } from '../fetcher';
import type { ApiOrder } from '@/types/api';
import type { ShippingAddress } from '../orders';

interface CreateOrderItem {
  productId: string;
  quantity: number;
  size?: string;
  colorId?: string;
}

export const orderApi = {
  async getMy(): Promise<ApiOrder[]> {
    return fetcher<ApiOrder[]>('/orders');
  },

  async getById(orderId: string): Promise<ApiOrder> {
    return fetcher<ApiOrder>(`/orders/${orderId}`);
  },

  async create(data: { items: CreateOrderItem[]; shippingAddress: ShippingAddress }): Promise<ApiOrder> {
    return fetcher<ApiOrder>('/orders', { method: 'POST', body: JSON.stringify(data) });
  },

  async cancel(orderId: string): Promise<void> {
    return fetcher<void>(`/orders/${orderId}/cancel`, { method: 'POST' });
  },
};
