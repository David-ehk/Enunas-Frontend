import { fetcher, getBaseUrl } from '../fetcher';
import type { AdminBrand, AdminCustomer, AdminPayout, ApiOrder, PayoutDashboard, AdminApiProduct } from '@/types/api';

interface Page<T> { content: T[] }
function unpage<T>(res: Page<T> | T[]): T[] {
  return Array.isArray(res) ? res : (res.content ?? []);
}

export const adminApi = {
  brands: {
    async getAll(): Promise<AdminBrand[]> {
      return unpage(await fetcher<Page<AdminBrand> | AdminBrand[]>('/admin/brands?page=0&size=100'));
    },
    async approve(id: string): Promise<void> {
      return fetcher<void>(`/admin/brands/${id}/approve`, { method: 'POST' });
    },
    async reject(id: string): Promise<void> {
      return fetcher<void>(`/admin/brands/${id}/reject`, { method: 'POST' });
    },
    async suspend(id: string): Promise<void> {
      return fetcher<void>(`/admin/brands/${id}/suspend`, { method: 'POST' });
    },
    // Backend SetPayoutProfileDto = { iban, bankAccountHolder } — nothing else
    async setPayoutProfile(id: string, dto: { iban: string; bankAccountHolder: string }): Promise<AdminBrand> {
      return fetcher<AdminBrand>(`/admin/brands/${id}/payout-profile`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    },

    // Backend AdminBrandMasterDataDto: address fields are @NotBlank (mandatory),
    // country is 2-letter; `domestic` is derived server-side from addressCountry === 'DE'.
    async updateStammdaten(id: string, dto: {
      legalName: string; addressStreet: string; addressPostalCode: string;
      addressCity: string; addressCountry: string; vatId?: string; taxNumber?: string;
    }): Promise<AdminBrand> {
      return fetcher<AdminBrand>(`/admin/brands/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    },

    async export22f(id: string, period: string, format: 'csv' | 'json'): Promise<Blob> {
      const token = typeof window !== 'undefined' ? localStorage.getItem('enunas_token') : null;
      const BASE = getBaseUrl();
      const res = await fetch(`${BASE}/admin/brands/${id}/22f-export?period=${period}&format=${format}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error(`Export fehlgeschlagen (${res.status})`);
      return res.blob();
    },
  },

  customers: {
    async getAll(): Promise<AdminCustomer[]> {
      return unpage(await fetcher<Page<AdminCustomer> | AdminCustomer[]>('/admin/customers?page=0&size=100'));
    },
    async getById(id: string): Promise<AdminCustomer> {
      return fetcher<AdminCustomer>(`/admin/customers/${id}`);
    },
    // Backend UpdateCustomerProfileDto has no `status` field — there is currently
    // no endpoint to suspend/deactivate a customer account.
  },

  products: {
    async getAll(): Promise<AdminApiProduct[]> {
      return unpage(await fetcher<Page<AdminApiProduct> | AdminApiProduct[]>('/admin/products?page=0&size=100'));
    },
    async approve(id: string): Promise<void> {
      return fetcher<void>(`/admin/products/${id}/approve`, { method: 'POST' });
    },
    async reject(id: string, reason?: string): Promise<void> {
      return fetcher<void>(`/admin/products/${id}/reject`, {
        method: 'POST',
        body: reason ? JSON.stringify({ reason }) : undefined,
      });
    },
    async hide(id: string): Promise<void> {
      return fetcher<void>(`/admin/products/${id}/hide`, { method: 'POST' });
    },
    async delete(id: string): Promise<void> {
      return fetcher<void>(`/admin/products/${id}`, { method: 'DELETE' });
    },
    // Backend UpdateProductDto has no `status` or `price` — status changes go through
    // approve/reject/hide; prices live on listings. Variant updates are BRAND_PARTNER-only.
    async update(id: string, dto: object): Promise<AdminApiProduct> {
      return fetcher<AdminApiProduct>(`/admin/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    },
  },

  orders: {
    async getAll(): Promise<ApiOrder[]> {
      return unpage(await fetcher<Page<ApiOrder> | ApiOrder[]>('/admin/orders?page=0&size=100'));
    },
    async getByStatus(status: string): Promise<ApiOrder[]> {
      return unpage(await fetcher<Page<ApiOrder> | ApiOrder[]>(`/admin/orders/status/${status}?page=0&size=100`));
    },
    async updateStatus(orderId: string, status: string): Promise<ApiOrder> {
      return fetcher<ApiOrder>(`/admin/orders/${orderId}/status?status=${status}`, { method: 'PATCH' });
    },
    // Backend CancelOrderDto: reason is the CancelReason enum (@NotNull), free text goes into note
    async cancel(
      orderId: string,
      reason: 'FRAUD_SUSPICION' | 'OUT_OF_STOCK' | 'CUSTOMER_REQUEST' | 'TECHNICAL_ERROR' | 'OTHER',
      note?: string,
    ): Promise<ApiOrder> {
      return fetcher<ApiOrder>(`/admin/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason, ...(note ? { note } : {}) }),
      });
    },
    async approveReturn(orderId: string): Promise<ApiOrder> {
      return fetcher<ApiOrder>(`/admin/orders/${orderId}/return/approve`, { method: 'POST' });
    },
    // Required between approve and refund: RETURN_APPROVED → RETURN_RECEIVED (restores stock)
    async receiveReturn(orderId: string): Promise<ApiOrder> {
      return fetcher<ApiOrder>(`/admin/orders/${orderId}/return/receive`, { method: 'POST' });
    },
    async refund(orderId: string, amount: number): Promise<ApiOrder> {
      return fetcher<ApiOrder>(`/admin/orders/${orderId}/return/refund?refundAmount=${amount}`, { method: 'POST' });
    },
  },

  payouts: {
    async getDashboard(): Promise<PayoutDashboard> {
      return fetcher<PayoutDashboard>('/admin/payouts/dashboard');
    },
    async getAll(status?: string): Promise<AdminPayout[]> {
      const q = status ? `&status=${status}` : '';
      return unpage(await fetcher<Page<AdminPayout> | AdminPayout[]>(`/admin/payouts?page=0&size=100${q}`));
    },
    async approve(id: string): Promise<void> {
      return fetcher<void>(`/admin/payouts/${id}/approve`, { method: 'POST' });
    },
    async cancel(id: string): Promise<void> {
      return fetcher<void>(`/admin/payouts/${id}/cancel`, { method: 'POST' });
    },
    // Backend MarkAsPaidDto expects `externalReference` (@NotBlank)
    async markPaid(id: string, reference: string): Promise<void> {
      return fetcher<void>(`/admin/payouts/${id}/paid`, {
        method: 'POST',
        body: JSON.stringify({ externalReference: reference }),
      });
    },
    async generate(): Promise<AdminPayout[]> {
      return fetcher<AdminPayout[]>('/admin/payouts/generate', { method: 'POST' });
    },
  },
};
