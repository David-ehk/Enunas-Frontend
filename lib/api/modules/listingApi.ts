import { fetcher } from '../fetcher';
import type { ApiListing, ApiPage } from '@/types/api';

// GET /listings is public: the backend applies the storefront browse gate (product ACTIVE and a
// currently-sellable listing) for anonymous callers, and exempts the owning brand and admins.
// The token is attached when present, so the same call serves both audiences.
export interface ListingSearchParams {
  /** Omit for "any region". Passing DE returns DE listings plus globally-sold ones. */
  region?: string;
  page?: number;
  size?: number;
}

function toPage(raw: ApiPage<ApiListing> | ApiListing[]): ApiPage<ApiListing> {
  // GET /listings became a Page in this round. Tolerate the old bare array so a mismatched
  // backend deploy degrades instead of crashing the caller.
  if (Array.isArray(raw)) {
    return { content: raw, totalElements: raw.length, totalPages: 1, number: 0, size: raw.length };
  }
  return raw;
}

export const listingApi = {
  async list(params: ListingSearchParams = {}): Promise<ApiPage<ApiListing>> {
    const qs = new URLSearchParams();
    // A missing region used to compile to `region = NULL` and match nothing. It now means
    // "any region" — so never send an empty value just to fill the slot.
    if (params.region) qs.set('region', params.region);
    if (params.page !== undefined) qs.set('page', String(params.page));
    if (params.size !== undefined) qs.set('size', String(params.size));
    const query = qs.toString() ? `?${qs}` : '';
    return toPage(await fetcher<ApiPage<ApiListing> | ApiListing[]>(`/listings${query}`));
  },

  // Throws FetchError(404) when the product is suspended/rejected or the listing's availability
  // window is closed — the lookup is gated now, it is no longer an ungated fetch by id.
  async getById(listingId: string | number): Promise<ApiListing> {
    return fetcher<ApiListing>(`/listings/${listingId}`);
  },
};
