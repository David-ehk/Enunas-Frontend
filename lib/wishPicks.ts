// Which three favourites the cart drawer shows: the ones that go best with what is in the cart.
import { productSegments } from './product'
import { isSoldOut, rankCartStyles } from './cartSuggestions'
import type { ApiProduct } from '@/types/api'

const MAX_FAVOURITES = 3

type Garment = 'top' | 'bottom'

const GARMENT_BY_SLOT: Record<string, Garment> = { TOP: 'top', BOTTOM: 'bottom' }

export function garmentGroup(p: ApiProduct): Garment | null {
  return GARMENT_BY_SLOT[p.outfitSlot ?? ''] ?? null
}

/**
 * Ranked by: not already in the cart, buyable, the cart's most important catalogue style, then the
 * other half of an outfit (tops for pants and the reverse), then the most recently saved.
 */
export function pickFavourites<T extends { id: string }>(
  favourites: T[],
  lines: { productId: string; quantity: number }[],
  products: ApiProduct[],
): T[] {
  const byId = new Map(products.map(p => [String(p.id), p]))
  const inCart = new Set(lines.map(l => String(l.productId)))
  // How many cart pieces carry each style. Equally common styles count alike.
  const styleWeights = new Map<string, number>(rankCartStyles(lines, products).map(s => [s, 0]))
  for (const line of lines) {
    for (const s of productSegments(byId.get(String(line.productId)))) {
      const weight = styleWeights.get(s)
      if (weight !== undefined) styleWeights.set(s, weight + line.quantity)
    }
  }
  const cartGarments = new Set(lines.map(l => {
    const p = byId.get(String(l.productId))
    return p ? garmentGroup(p) : null
  }))

  const key = (favourite: T, savedIndex: number): number[] => {
    const p = byId.get(String(favourite.id))
    const buyable = !!p && p.available && !p.preview && !isSoldOut(p)
    const styleWeight = Math.max(0, ...productSegments(p).map(s => styleWeights.get(s) ?? 0))
    const garment = p ? garmentGroup(p) : null
    const completes = garment !== null && cartGarments.has(garment === 'top' ? 'bottom' : 'top')
    return [
      Number(inCart.has(String(favourite.id))),
      Number(!buyable),
      -styleWeight,
      Number(!completes),
      -savedIndex,
    ]
  }

  return favourites
    .map((favourite, index) => ({ favourite, key: key(favourite, index) }))
    .sort((a, b) => {
      const i = a.key.findIndex((value, n) => value !== b.key[n])
      return i < 0 ? 0 : a.key[i] - b.key[i]
    })
    .slice(0, MAX_FAVOURITES)
    .map(entry => entry.favourite)
}
