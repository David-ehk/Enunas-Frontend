// lib/product.ts
export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  currency: string;
  colors: ProductColor[];
  sizes: string[];
  catalogue: string[];
  sku: string;
  images: string[];
  category: string[];
  details: ProductDetails;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  slug: string;
}

export interface ProductDetails {
  material?: string;
  care?: string;
  origin?: string;
  [key: string]: string | undefined;
}



// Slug-Generierungsfunktion
/**
 * True when a product is live and sellable.
 *
 * The backend's resting state for a published product is ACTIVE; APPROVED shows
 * up as a transitional value from the approve action. Comparing against a single
 * literal silently hides live products — that is what emptied the Schaufenster
 * recommendation picker.
 */
export function isProductLive(status: string | undefined): boolean {
  return status === 'ACTIVE' || status === 'APPROVED'
}

export const SEGMENT_LABELS: Record<string, string> = {
  streetwear: 'Streetwear',
  cultural: 'Cultural',
  athleisure: 'Athleisure',
  experimental: 'Experimental',
  star: 'Star',
}

/**
 * Normalised catalogue segments for a product.
 *
 * Tolerates both field names — the adapter emits `catalogue` (lowercased) but raw
 * endpoints such as /wardrobe return `catalogueCategory` — and both string and
 * array shapes. `culture` is folded into `cultural`, the canonical segment id.
 */
export function productSegments(
  p: { catalogue?: string[]; catalogueCategory?: string | string[] } | null | undefined,
): string[] {
  if (!p) return []
  const raw = p.catalogue ?? p.catalogueCategory ?? []
  const arr = Array.isArray(raw) ? raw : [raw]
  const seen = new Set<string>()
  for (const c of arr) {
    if (!c) continue
    const s = String(c).trim().toLowerCase()
    seen.add(s === 'culture' ? 'cultural' : s)
  }
  return [...seen]
}

/** Counts products per segment, most common first. A product counts once per segment. */
export function segmentBreakdown(
  products: ({ catalogue?: string[]; catalogueCategory?: string | string[] } | null | undefined)[],
): { segment: string; label: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const p of products) {
    for (const s of productSegments(p)) counts.set(s, (counts.get(s) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([segment, count]) => ({
      segment,
      label: SEGMENT_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}
 