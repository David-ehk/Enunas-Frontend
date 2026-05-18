import { fetcher } from '../fetcher';
import type {
  AdminBrand,
  AdminCustomer,
  ApiProduct,
  ApiOrder,
  ApiOrderStatus,
} from '../../types/api';

export const adminApi = {
  brands: {
    getAll(): Promise<AdminBrand[]> {
      return fetcher<AdminBrand[]>('/admin/brands');
    },
    approve(brandId: string): Promise<void> {
      return fetcher<void>(`/admin/brands/${brandId}/approve`, { method: 'POST' });
    },
    reject(brandId: string): Promise<void> {
      return fetcher<void>(`/admin/brands/${brandId}/reject`, { method: 'POST' });
    },
    suspend(brandId: string): Promise<void> {
      return fetcher<void>(`/admin/brands/${brandId}/suspend`, { method: 'POST' });
    },
    updatePayoutProfile(brandId: string, data: Record<string, unknown>): Promise<void> {
      return fetcher<void>(`/admin/brands/${brandId}/payout-profile`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
  },

  products: {
    getAll(): Promise<ApiProduct[]> {
      return fetcher<ApiProduct[]>('/admin/products');
    },
    update(productId: string, data: Partial<ApiProduct>): Promise<ApiProduct> {
      return fetcher<ApiProduct>(`/admin/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    delete(productId: string): Promise<void> {
      return fetcher<void>(`/admin/products/${productId}`, { method: 'DELETE' });
    },
    approve(productId: string): Promise<void> {
      return fetcher<void>(`/admin/products/${productId}/approve`, { method: 'POST' });
    },
    reject(productId: string): Promise<void> {
      return fetcher<void>(`/admin/products/${productId}/reject`, { method: 'POST' });
    },
    hide(productId: string): Promise<void> {
      return fetcher<void>(`/admin/products/${productId}/hide`, { method: 'POST' });
    },
  },

  customers: {
    getAll(): Promise<AdminCustomer[]> {
      return fetcher<AdminCustomer[]>('/admin/customers');
    },
    getById(id: string): Promise<AdminCustomer> {
      return fetcher<AdminCustomer>(`/admin/customers/${id}`);
    },
    update(id: string, data: Partial<AdminCustomer>): Promise<AdminCustomer> {
      return fetcher<AdminCustomer>(`/admin/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
  },

  orders: {
    getAll(): Promise<ApiOrder[]> {
      return fetcher<ApiOrder[]>('/admin/orders');
    },
    getById(orderId: string): Promise<ApiOrder> {
      return fetcher<ApiOrder>(`/admin/orders/${orderId}`);
    },
    getByStatus(status: ApiOrderStatus): Promise<ApiOrder[]> {
      return fetcher<ApiOrder[]>(`/admin/orders/status/${status}`);
    },
    updateStatus(orderId: string, status: ApiOrderStatus): Promise<void> {
      return fetcher<void>(`/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    cancel(orderId: string): Promise<void> {
      return fetcher<void>(`/admin/orders/${orderId}/cancel`, { method: 'POST' });
    },
    approveReturn(orderId: string): Promise<void> {
      return fetcher<void>(`/admin/orders/${orderId}/return/approve`, { method: 'POST' });
    },
    receiveReturn(orderId: string): Promise<void> {
      return fetcher<void>(`/admin/orders/${orderId}/return/receive`, { method: 'POST' });
    },
    refundReturn(orderId: string): Promise<void> {
      return fetcher<void>(`/admin/orders/${orderId}/return/refund`, { method: 'POST' });
    },
  },
};
