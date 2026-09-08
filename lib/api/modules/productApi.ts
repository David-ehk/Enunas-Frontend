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
    available: true,
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

// Storefront listings must not merchandise anything that cannot be bought. A product with no
// active listing comes back with a null price, which would otherwise render as 0,00 € and still
// be addable to the basket. Detail routes deliberately do NOT use this — the PDP keeps rendering
// an unavailable product so a direct link shows "Preis nicht verfügbar" rather than a 404.
// Keep sellable products AND preview ("Coming Soon") products — the latter are deliberately
// merchandised before release (no price, not buyable). Everything else with no active listing
// is still dropped so it never renders as 0,00 € or reaches the basket.
export function sellableOnly(raw: RawPagedProducts, content: ApiProduct[]): PagedProducts {
  const sellable = content.filter(p => p.available || p.preview);
  const removed = content.length - sellable.length;
  return {
    ...raw,
    content: sellable,
    totalElements: Math.max(0, raw.totalElements - removed),
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
      return sellableOnly(raw, raw.content.map(adaptProduct));
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
    return sellableOnly(raw, raw.content.map(adaptProduct));
  },

  // Public: GET /products/** is permitAll. Anonymous callers get the browse-gated view, which
  // is an empty list for a hidden product (deliberately not a 404 — the PDP keeps rendering an
  // unavailable product and shows "Preis nicht verfügbar"). The owning brand and admins get the
  // full management view; the token is attached automatically when one exists.
  // The route returns a List; a Page is tolerated so a backend shape change cannot break the PDP.
  async getListings(productId: string): Promise<ApiListing[]> {
    const raw = await fetcher<ApiListing[] | { content: ApiListing[] }>(`/products/${productId}/listings`);
    return Array.isArray(raw) ? raw : raw.content ?? [];
  },

  async getMy(): Promise<ApiProduct[]> {
    return fetcher<ApiProduct[]>('/vendors/me/products');
  },
};
