// The cart drawer's data, loaded once and shared by both tabs so the backend sees few requests.
import type { ApiProduct, CurationData } from '@/types/api'

export interface CartShelf {
  products: ApiProduct[]
  curation: CurationData | null
}

const FIVE_MINUTES = 300_000

export function createCartShelfLoader({
  listProducts,
  getCuration,
  now = Date.now,
  ttlMs = FIVE_MINUTES,
}: {
  listProducts: () => Promise<ApiProduct[]>
  getCuration: () => Promise<CurationData>
  now?: () => number
  ttlMs?: number
}): () => Promise<CartShelf> {
  let cached: { at: number; shelf: Promise<CartShelf> } | null = null

  return () => {
    if (cached && now() - cached.at < ttlMs) return cached.shelf

    const shelf = Promise.all([listProducts(), getCuration().catch(() => null)])
      .then(([products, curation]) => ({ products, curation }))
    const entry = { at: now(), shelf }
    cached = entry

    // Anything incomplete is dropped so the next opening tries again.
    const drop = () => { if (cached === entry) cached = null }
    shelf.then(s => { if (!s.curation) drop() }, drop)
    return shelf
  }
}
