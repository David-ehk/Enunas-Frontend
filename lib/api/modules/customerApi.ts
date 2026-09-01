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

  // DSGVO Art. 17 erasure. Irreversible: profile, saved addresses and OAuth links are erased and
  // the login identity becomes a tombstone. 204 on success — the token is dead immediately, so
  // the caller must clear the session before any further request. 409 while an order is still
  // in flight; that message is customer-facing German and is shown verbatim.
  // Order history itself is retained for ten years (§257 HGB).
  async deleteMe(): Promise<void> {
    return fetcher<void>('/customer/me', { method: 'DELETE' });
  },
};
