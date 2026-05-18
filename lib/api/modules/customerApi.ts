import { fetcher } from '../fetcher';
import type { ApiUser, ApiCustomer } from '../../../types/api';

export const customerApi = {
  async getMe(signal?: AbortSignal): Promise<ApiUser> {
    return fetcher<ApiUser>('/users/me', { signal });
  },

  async getCustomerProfile(signal?: AbortSignal): Promise<ApiCustomer> {
    return fetcher<ApiCustomer>('/customer/me', { signal });
  },

  async updateCustomerProfile(data: Partial<ApiCustomer>): Promise<ApiCustomer> {
    return fetcher<ApiCustomer>('/customer/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
