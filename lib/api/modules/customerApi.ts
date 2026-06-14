import { fetcher } from '../fetcher';
import type { ApiCustomer } from '@/types/api';

// Mirrors backend UpdateCustomerProfileDto
export interface UpdateCustomerProfileDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  country?: string;
  city?: string;
  preferredSizeTop?: string;
  preferredSizeBottom?: string;
  preferredSizeShoes?: string;
  heightCm?: number;
  weightKg?: number;
}

export const customerApi = {
  async getMe(): Promise<ApiCustomer> {
    return fetcher<ApiCustomer>('/customer/me');
  },

  async updateProfile(dto: UpdateCustomerProfileDto): Promise<ApiCustomer> {
    return fetcher<ApiCustomer>('/customer/me', { method: 'PATCH', body: JSON.stringify(dto) });
  },
};
