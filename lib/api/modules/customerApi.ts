import { fetcher } from '../fetcher';
import type { ApiCustomer } from '@/types/api';

export const customerApi = {
  async getMe(): Promise<ApiCustomer> {
    return fetcher<ApiCustomer>('/customers/me');
  },

  async updateCustomerProfile(data: { firstName?: string; lastName?: string }): Promise<ApiCustomer> {
    return fetcher<ApiCustomer>('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) });
  },
};
