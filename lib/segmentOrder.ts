/**
 * Canonical display order for the 5 Enunas catalogue segments, on every product card and tag
 * list. Streetwear always leads when present; the rest follow this fixed order rather than
 * whatever order the backend returned them in.
 */
const SEGMENT_ORDER = ['streetwear', 'experimental', 'athleisure', 'cultural', 'star']

function rank(segment: string): number {
  const key = segment.toLowerCase() === 'culture' ? 'cultural' : segment.toLowerCase()
  const i = SEGMENT_ORDER.indexOf(key)
  return i === -1 ? SEGMENT_ORDER.length : i
}

/** Sorts a product's catalogue segments into the canonical order. Unknown segments sort last,
 *  keeping their relative order. Does not mutate the input. */
export function sortSegments(segments: string[]): string[] {
  return segments
    .map((segment, index) => ({ segment, index }))
    .sort((a, b) => rank(a.segment) - rank(b.segment) || a.index - b.index)
    .map(({ segment }) => segment)
}
