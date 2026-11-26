// Which Schaufenster recommendations the cart drawer shows: the cart's dominant style decides.
import { productSegments, SEGMENT_LABELS } from './product'
import type { ApiProduct, CurationData, Segment } from '@/types/api'

const MAX_PICKS = 3

type CartLine = { productId: string; quantity: number }

/** Cart styles, most pieces first; a tie goes to the most recently added line. */
export function rankCartStyles(lines: CartLine[], products: ApiProduct[]): Segment[] {
  const byId = new Map(products.map(p => [String(p.id), p]))
  const scores = new Map<string, { count: number; last: number }>()

  lines.forEach((line, index) => {
    for (const style of productSegments(byId.get(String(line.productId)))) {
      if (!(style in SEGMENT_LABELS)) continue
      const count = (scores.get(style)?.count ?? 0) + line.quantity
      scores.set(style, { count, last: index })
    }
  })

  return [...scores.entries()]
    .sort(([, a], [, b]) => b.count - a.count || b.last - a.last)
    .map(([style]) => style as Segment)
}

export function isSoldOut(p: ApiProduct): boolean {
  return !!p.variants?.length && p.variants.every(v => v.stockQuantity === 0)
}

/** Up to three buyable picks from the highest-ranked style that has any. Styles are not mixed. */
export function pickSuggestions(
  lines: CartLine[],
  products: ApiProduct[],
  curation: CurationData | null,
): ApiProduct[] {
  if (!curation) return []
  const byId = new Map(products.map(p => [String(p.id), p]))
  const inCart = new Set(lines.map(l => String(l.productId)))

  for (const style of rankCartStyles(lines, products)) {
    const picks = (curation.recommendations[style] ?? []).flatMap(id => {
      const p = byId.get(String(id))
      return p && !inCart.has(String(id)) && p.available && !p.preview && !isSoldOut(p) ? [p] : []
    })
    if (picks.length > 0) return picks.slice(0, MAX_PICKS)
  }
  return []
}
