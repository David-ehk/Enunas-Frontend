import { fetcher } from '../fetcher';
import type { ApiBrandPartner, BrandPartnerApplyRequest, BrandOrder } from '../../types/api';

export const brandApi = {
  async apply(data: BrandPartnerApplyRequest): Promise<ApiBrandPartner> {
    return fetcher<ApiBrandPartner>('/brandpartner/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verify(code: string): Promise<void> {
    return fetcher<void>('/brandpartner/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  async resendVerification(): Promise<void> {
    return fetcher<void>('/brandpartner/resend-verification', { method: 'POST' });
  },

  async getMe(): Promise<ApiBrandPartner> {
    return fetcher<ApiBrandPartner>('/brandpartner/me');
  },

  async updateMe(data: Partial<ApiBrandPartner>): Promise<ApiBrandPartner> {
    return fetcher<ApiBrandPartner>('/brandpartner/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async getById(id: string): Promise<ApiBrandPartner> {
    return fetcher<ApiBrandPartner>(`/brandpartner/${id}`, { auth: false });
  },

  async getOrders(): Promise<BrandOrder[]> {
    return fetcher<BrandOrder[]>('/brand/orders');
  },

  async shipOrder(orderId: string, trackingNumber: string): Promise<void> {
    return fetcher<void>(`/brand/orders/${orderId}/ship`, {
      method: 'POST',
      body: JSON.stringify({ trackingNumber }),
    });
  },

  async reportOrderProblem(orderId: string, reason: string): Promise<void> {
    return fetcher<void>(`/brand/orders/${orderId}/problem`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};
