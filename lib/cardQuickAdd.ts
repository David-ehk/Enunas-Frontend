// What the "+" on a product card offers. Adding itself goes through lib/quickAdd, like the cart rows.
import { isSoldOut } from './cartSuggestions'
import { savedColour, sizeChoices, variantColours } from './quickAdd'
import type { ApiProduct } from '@/types/api'

export function cardQuickAdd(p: ApiProduct) {
  if (p.preview || !p.available || isSoldOut(p)) return null

  // No saved colour on a card: this is the first colour with stock.
  const colour = savedColour(p, '')
  if (!colour) return null

  return { colour, sizes: sizeChoices(p, colour), manyColours: variantColours(p).length > 1 }
}
