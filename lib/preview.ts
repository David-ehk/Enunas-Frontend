// "Coming Soon" (preview) product placement + formatting helpers.
// Spec: docs/superpowers/specs/2026-09-08-coming-soon-preview-state-design.md §7, §12.

const DAY_MS = 86_400_000

/** UTC-midnight instant (ms) of a "YYYY-MM-DD" release date — the moment the backend flips the
 *  product to live, and therefore the countdown target. */
export function previewReleaseMs(releaseDate: string): number {
  const [y, m, d] = releaseDate.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** True when the release is at most `days` away (or already past). */
export function isWithinDays(releaseDate: string, days: number, now: number = Date.now()): boolean {
  return previewReleaseMs(releaseDate) - now <= days * DAY_MS
}

export type PreviewMode = 'show' | 'window7' | 'hide'

interface Previewish {
  preview?: boolean | null
  releaseDate?: string | null
}

/**
 * Apply a surface's preview-placement rule:
 *  - 'hide'    → drop every preview item (homepage, /trendy)
 *  - 'window7' → drop preview items releasing more than 7 days out (/neu)
 *  - 'show'    → keep all preview items (catalogue, category, search, /marken, PDP recs)
 * In every mode, live items are returned before preview items; relative order within each group
 * is preserved (preview items have no price/date to fold into the caller's sort).
 */
export function partitionPreview<T extends Previewish>(
  items: T[],
  mode: PreviewMode,
  now: number = Date.now(),
): T[] {
  const live: T[] = []
  const preview: T[] = []
  for (const item of items) {
    if (!item.preview) { live.push(item); continue }
    if (mode === 'hide') continue
    if (mode === 'window7' && !(item.releaseDate && isWithinDays(item.releaseDate, 7, now))) continue
    preview.push(item)
  }
  return [...live, ...preview]
}

const LONG = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
const SHORT = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long' })

/** "2026-10-01" → "1. Oktober 2026" */
export function formatReleaseDate(releaseDate: string): string {
  return LONG.format(new Date(`${releaseDate}T00:00:00Z`))
}

/** "2026-10-01" → "1. Oktober" */
export function formatReleaseDateShort(releaseDate: string): string {
  return SHORT.format(new Date(`${releaseDate}T00:00:00Z`))
}
