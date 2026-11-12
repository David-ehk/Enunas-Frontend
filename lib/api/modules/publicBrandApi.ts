import { fetcher, FetchError } from '../fetcher'

// Mirrors backend BrandPublicProfileDto — GET /brands/slug/{slug}/public-profile (no auth),
// the slug twin of /brands/{id}/public-profile. ACTIVE brands only; no email/address/VAT data.
// logoUrl/heroImageUrl are null when the brand hasn't uploaded one.
export interface PublicBrand {
  id: number
  brandName: string
  slug: string
  logoUrl: string | null
  heroImageUrl: string | null
  description: string | null
  country: string | null
  websiteUrl: string | null
  instagramHandle: string | null
  tiktokHandle: string | null
}

export const publicBrandApi = {
  /** null when no ACTIVE brand has that slug (404). Other failures are rethrown. */
  async getBySlug(slug: string): Promise<PublicBrand | null> {
    try {
      return await fetcher<PublicBrand>(`/brands/slug/${encodeURIComponent(slug)}/public-profile`, { auth: false })
    } catch (err) {
      if (err instanceof FetchError && err.status === 404) return null
      throw err
    }
  },
}
