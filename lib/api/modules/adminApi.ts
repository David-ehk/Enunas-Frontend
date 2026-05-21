import { fetcher } from '../fetcher';
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
    async setPayoutProfile(id: string, dto: { iban: string; accountHolder: string; bankName: string; bic: string }): Promise<AdminBrand> {
      return fetcher<AdminBrand>(`/admin/brands/${id}/payout-profile`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    },
  },

  customers: {
    async getAll(): Promise<AdminCustomer[]> {
      return unpage(await fetcher<Page<AdminCustomer> | AdminCustomer[]>('/admin/customers?page=0&size=100'));
    },
    async getById(id: string): Promise<AdminCustomer> {
      return fetcher<AdminCustomer>(`/admin/customers/${id}`);
    },
    async suspend(id: string): Promise<AdminCustomer> {
      return fetcher<AdminCustomer>(`/admin/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'SUSPENDED' }),
      });
    },
    async unsuspend(id: string): Promise<AdminCustomer> {
      return fetcher<AdminCustomer>(`/admin/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
    },
    async deactivate(id: string): Promise<AdminCustomer> {
      return fetcher<AdminCustomer>(`/admin/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'DEACTIVATED' }),
      });
    },
  },

  products: {
    async getAll(): Promise<AdminApiProduct[]> {
      return unpage(await fetcher<Page<AdminApiProduct> | AdminApiProduct[]>('/admin/products?page=0&size=100'));
    },
    async approve(id: string): Promise<void> {
      return fetcher<void>(`/admin/products/${id}/approve`, { method: 'POST' });
    },
    async reject(id: string): Promise<void> {
      return fetcher<void>(`/admin/products/${id}/reject`, { method: 'POST' });
    },
    async hide(id: string): Promise<void> {
      return fetcher<void>(`/admin/products/${id}/hide`, { method: 'POST' });
    },
    async delete(id: string): Promise<void> {
      return fetcher<void>(`/admin/products/${id}`, { method: 'DELETE' });
    },
    async deactivate(id: string): Promise<AdminApiProduct> {
      return fetcher<AdminApiProduct>(`/admin/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'DEACTIVATED' }),
      });
    },
    async update(id: string, dto: object): Promise<AdminApiProduct> {
      return fetcher<AdminApiProduct>(`/admin/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    },
    async updateVariant(productId: string, variantId: string, dto: object): Promise<object> {
      return fetcher<object>(`/products/${productId}/variants/${variantId}`, {
        method: 'PUT',
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
    async cancel(orderId: string, reason: string): Promise<ApiOrder> {
      return fetcher<ApiOrder>(`/admin/orders/${orderId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
    },
    async approveReturn(orderId: string): Promise<ApiOrder> {
      return fetcher<ApiOrder>(`/admin/orders/${orderId}/return/approve`, { method: 'POST' });
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
    async markPaid(id: string, reference: string): Promise<void> {
      return fetcher<void>(`/admin/payouts/${id}/paid`, {
        method: 'POST',
        body: JSON.stringify({ paymentReference: reference }),
      });
    },
    async generate(): Promise<AdminPayout[]> {
      return fetcher<AdminPayout[]>('/admin/payouts/generate', { method: 'POST' });
    },
  },
};
