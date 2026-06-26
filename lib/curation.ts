import { productApi } from '@/lib/api'
import type { ApiProduct } from '@/types/api'

export type Segment = 'streetwear' | 'cultural' | 'athleisure' | 'experimental' | 'star'

export interface CurationData {
  trendy: string[]
  drops: string[]
  recommendations: Record<Segment, string[]>
}

const STORAGE_KEY = 'enunas_curation_v1'

function empty(): CurationData {
  return {
    trendy: [],
    drops: [],
    recommendations: { streetwear: [], cultural: [], athleisure: [], experimental: [], star: [] },
  }
}

export function getCuration(): CurationData {
  if (typeof window === 'undefined') return empty()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty()
    const p = JSON.parse(raw) as Partial<CurationData>
    return {
      trendy: p.trendy ?? [],
      drops:  p.drops ?? [],
      recommendations: {
        streetwear:   p.recommendations?.streetwear   ?? [],
        cultural:     p.recommendations?.cultural     ?? [],
        athleisure:   p.recommendations?.athleisure   ?? [],
        experimental: p.recommendations?.experimental ?? [],
        star:         p.recommendations?.star         ?? [],
      },
    }
  } catch {
    return empty()
  }
}

export function saveCuration(data: CurationData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Resolve a curated list of product IDs to products, falling back to the newest products
 * when the admin hasn't curated anything yet.
 *
 * Curation is stored in admin localStorage, so for any visitor whose browser was never
 * seeded by the Storefront tool the curated lists are empty — without a fallback those
 * storefront sections render blank for every real visitor. When `ids` is empty we show the
 * newest products instead so the section is never empty.
 */
export async function resolveCuratedOrNewest(ids: string[], count: number): Promise<ApiProduct[]> {
  if (ids.length > 0) {
    const results = await Promise.all(ids.map(id => productApi.getById(id).catch(() => null)))
    const found = results.filter((p): p is ApiProduct => p !== null)
    if (found.length > 0) return found
  }
  // Fallback: newest approved products.
  try {
    const res = await productApi.list({ size: count })
    return [...res.content]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, count)
  } catch {
    return []
  }
}
