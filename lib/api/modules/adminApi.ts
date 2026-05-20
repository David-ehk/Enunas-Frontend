import { fetcher } from '../fetcher';
import type { AdminBrand, ApiProduct, ApiOrder } from '@/types/api';

export const adminApi = {
  brands: {
    async getAll(): Promise<AdminBrand[]> {
      return fetcher<AdminBrand[]>('/admin/vendors');
    },
    async approve(id: string): Promise<void> {
      return fetcher<void>(`/admin/vendors/${id}/approve`, { method: 'POST' });
    },
    async reject(id: string): Promise<void> {
      return fetcher<void>(`/admin/vendors/${id}/reject`, { method: 'POST' });
    },
  },

  products: {
    async getAll(): Promise<ApiProduct[]> {
      return fetcher<ApiProduct[]>('/admin/products');
    },
    async approve(id: string): Promise<void> {
      return fetcher<void>(`/admin/products/${id}/approve`, { method: 'POST' });
    },
    async reject(id: string): Promise<void> {
      return fetcher<void>(`/admin/products/${id}/reject`, { method: 'POST' });
    },
  },

  orders: {
    async getAll(): Promise<ApiOrder[]> {
      return fetcher<ApiOrder[]>('/admin/orders');
    },
  },
};
