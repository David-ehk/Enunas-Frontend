import { fetcher } from '../fetcher';
import type { ApiUser, ApiCustomer } from '../../types/api';

export const customerApi = {
  async getMe(): Promise<ApiUser> {
    return fetcher<ApiUser>('/users/me');
  },

  async getCustomerProfile(): Promise<ApiCustomer> {
    return fetcher<ApiCustomer>('/customer/me');
  },

  async updateCustomerProfile(data: Partial<ApiCustomer>): Promise<ApiCustomer> {
    return fetcher<ApiCustomer>('/customer/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
