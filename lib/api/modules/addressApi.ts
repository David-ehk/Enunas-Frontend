import { fetcher } from '../fetcher';
import type { ApiUserAddress } from '@/types/api';

// Mirrors backend UserAddressDto. Full replace on update, not a partial patch — an address is a
// value object on the backend, matching how UserAddressController's PUT is implemented.
export interface UserAddressDto {
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  country: string;
}

export const addressApi = {
  async getAll(): Promise<ApiUserAddress[]> {
    return fetcher<ApiUserAddress[]>('/customer/addresses');
  },

  async create(dto: UserAddressDto): Promise<ApiUserAddress> {
    return fetcher<ApiUserAddress>('/customer/addresses', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async update(id: number, dto: UserAddressDto): Promise<ApiUserAddress> {
    return fetcher<ApiUserAddress>(`/customer/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },

  async remove(id: number): Promise<void> {
    return fetcher<void>(`/customer/addresses/${id}`, { method: 'DELETE' });
  },

  async setDefault(id: number): Promise<ApiUserAddress> {
    return fetcher<ApiUserAddress>(`/customer/addresses/${id}/default`, { method: 'POST' });
  },
};
