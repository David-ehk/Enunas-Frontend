import { fetcher } from '../fetcher';
import type { ApiProduct, ApiListing } from '@/types/api';
import { mockProducts } from '../mockProducts';
import { adaptProduct, type RawProductResponse, type RawPagedProducts } from '../productResponseAdapter';

// Step-0 masking switch: set NEXT_PUBLIC_DISABLE_MOCK=true to forbid the dev mock fallback,
// so a failing real request surfaces as an error/empty state instead of being papered over
// with mock data. Mock is only ever used in development AND when not explicitly disabled.
function mockAllowed(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DISABLE_MOCK !== 'true';
}

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

function mockToApiProduct(m: (typeof mockProducts)[number]): ApiProduct {
  return {
    id: m.id,
    name: m.productName,
    brandName: m.brandName,
    sku: m.sku ?? `MOCK-${m.id}`,
    slug: m.slug,
    description: m.description,
    price: m.priceNumber,
    currency: 'EUR',
    category: m.category,
    subcategory: m.subcategory,
    images: m.images ?? [m.imgURL],
    colours: m.colours.map(c => ({ hex: c.hex, name: c.name })),
    sizes: m.sizes,
    catalogue: m.catalogue,
    status: 'APPROVED' as const,
    createdAt: m.createdAt.toISOString(),
    details: m.details,
  };
}

export const productApi = {
  async list(params: ProductSearchParams = {}): Promise<PagedProducts> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) qs.set(k, String(v));
    });
    const query = qs.toString() ? `?${qs}` : '';
    try {
      const raw = await fetcher<RawPagedProducts>(`/products${query}`);
      return { ...raw, content: raw.content.map(adaptProduct) };
    } catch {
      if (!mockAllowed()) throw new Error('Failed to fetch products');
      let items = mockProducts.map(mockToApiProduct);
      if (params.category) items = items.filter(p => p.category === params.category);
      if (params.size) items = items.slice(0, params.size);
      return { content: items, totalElements: items.length, totalPages: 1, size: items.length, page: 0 };
    }
  },

  async getById(id: string): Promise<ApiProduct> {
    return adaptProduct(await fetcher<RawProductResponse>(`/products/${id}`));
  },

  async getBySlug(slug: string): Promise<ApiProduct> {
    return adaptProduct(await fetcher<RawProductResponse>(`/products/slug/${slug}`));
  },

  async search(keyword: string): Promise<PagedProducts> {
    const raw = await fetcher<RawPagedProducts>(
      `/products/search?keyword=${encodeURIComponent(keyword)}`,
    );
    return { ...raw, content: raw.content.map(adaptProduct) };
  },

  // Requires CUSTOMER or BRAND_PARTNER auth — token must be available.
  async getListings(productId: string): Promise<ApiListing[]> {
    return fetcher<ApiListing[]>(`/products/${productId}/listings`);
  },

  async getMy(): Promise<ApiProduct[]> {
    return fetcher<ApiProduct[]>('/vendors/me/products');
  },
};
