import { fetcher, FetchError } from '../fetcher';
import { getToken } from '../auth';
import { adaptProduct, type RawProductResponse } from '../productResponseAdapter';
import type { ApiProduct, CurationData, Segment } from '@/types/api';

export interface StorefrontRecommendations {
  personalized: boolean;
  /** Lowercase segment key, or null when the list isn't personalized. Never required. */
  primarySegment: Segment | null;
  /** Already in display order — the backend filters, orders and limits them. */
  products: ApiProduct[];
}

interface RawRecommendations {
  personalized: boolean;
  primarySegment: Segment | null;
  products: RawProductResponse[];
}

async function fetchRecommendations(query: string, token: string | null): Promise<RawRecommendations> {
  // The token is attached by hand (auth: false) on purpose: fetcher ends the whole session on a
  // 401 that carried its token, but an expired token must only downgrade this rail to the
  // general list. Personal responses are private — never let a cache layer keep them.
  return fetcher<RawRecommendations>(`/storefront/recommendations?${query}`, {
    auth: false,
    cache: 'no-store',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

export const storefrontApi = {
  /** Public, read-only. Contains only visible products, in admin order. */
  async getCuration(): Promise<CurationData> {
    return fetcher<CurationData>('/storefront/curation', { auth: false });
  },

  admin: {
    /** All saved ids, including hidden products. The only valid source for the editor. */
    async getCuration(): Promise<CurationData> {
      return fetcher<CurationData>('/admin/storefront/curation');
    },
    /** Replaces ALL lists — always send the complete object. Returns the saved state. */
    async saveCuration(data: CurationData): Promise<CurationData> {
      return fetcher<CurationData>('/admin/storefront/curation', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  async getRecommendations(params: { size: number; excludeProductId?: string }): Promise<StorefrontRecommendations> {
    const qs = new URLSearchParams({ size: String(params.size) });
    if (params.excludeProductId) qs.set('excludeProductId', params.excludeProductId);
    const query = qs.toString();
    const token = getToken();

    let raw: RawRecommendations;
    try {
      raw = await fetchRecommendations(query, token);
    } catch (err) {
      // Expired/invalid token → one retry as an anonymous visitor, never more.
      if (!(token && err instanceof FetchError && err.status === 401)) throw err;
      raw = await fetchRecommendations(query, null);
    }
    return {
      personalized: raw.personalized,
      primarySegment: raw.primarySegment,
      products: raw.products.map(adaptProduct),
    };
  },
};
