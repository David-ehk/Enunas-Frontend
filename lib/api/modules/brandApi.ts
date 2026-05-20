import { fetcher } from '../fetcher';
import type { ApiBrandPartner, BrandOrder } from '@/types/api';

export const brandApi = {
  async getMe(): Promise<ApiBrandPartner> {
    return fetcher<ApiBrandPartner>('/vendors/me');
  },

  async getOrders(): Promise<BrandOrder[]> {
    return fetcher<BrandOrder[]>('/vendors/me/orders');
  },

  async shipOrder(orderId: string, trackingNumber: string): Promise<void> {
    return fetcher<void>(`/vendors/me/orders/${orderId}/ship`, {
      method: 'POST',
      body: JSON.stringify({ trackingNumber }),
    });
  },
};
