import { fetcher } from '../fetcher';
import type { ApiProduct, ApiListing } from '@/types/api';

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
    return fetcher<PagedProducts>(`/products${query}`);
  },

  async getById(id: string): Promise<ApiProduct> {
    return fetcher<ApiProduct>(`/products/${id}`);
  },

  // /products/slug/{slug} does not exist in the backend — use search by name or getById.
  async getBySlug(slug: string): Promise<ApiProduct> {
    return fetcher<ApiProduct>(`/products/slug/${slug}`);
  },

  async search(keyword: string): Promise<PagedProducts> {
    return fetcher<PagedProducts>(
      `/products/search?keyword=${encodeURIComponent(keyword)}`,
    );
  },

  // Requires CUSTOMER or BRAND_PARTNER auth — token must be available.
  async getListings(productId: string): Promise<ApiListing[]> {
    return fetcher<ApiListing[]>(`/products/${productId}/listings`);
  },

  async getMy(): Promise<ApiProduct[]> {
    return fetcher<ApiProduct[]>('/vendors/me/products');
  },
};
