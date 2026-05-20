import { fetcher } from '../fetcher';
import type { ApiProduct } from '@/types/api';

export interface ProductSearchParams {
  size?: number;
  page?: number;
  category?: string;
  subcategory?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface PagedProducts {
  content: ApiProduct[];
  totalElements: number;
  totalPages: number;
  size: number;
  page: number;
}

export const productApi = {
  async list(params: ProductSearchParams = {}): Promise<PagedProducts> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) qs.set(k, String(v));
    });
    const query = qs.toString() ? `?${qs}` : '';
    return fetcher<PagedProducts>(`/products${query}`, { auth: false });
  },

  async getById(id: string): Promise<ApiProduct> {
    return fetcher<ApiProduct>(`/products/${id}`, { auth: false });
  },

  async getBySlug(slug: string): Promise<ApiProduct> {
    return fetcher<ApiProduct>(`/products/slug/${slug}`, { auth: false });
  },

  async search(q: string): Promise<ApiProduct[]> {
    return fetcher<ApiProduct[]>(`/products/search?q=${encodeURIComponent(q)}`, { auth: false });
  },

  async getMy(): Promise<ApiProduct[]> {
    return fetcher<ApiProduct[]>('/vendors/me/products');
  },
};
