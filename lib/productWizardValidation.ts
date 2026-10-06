export const MAX_RETURN_PERIOD_DAYS = 30

/** Error message for an out-of-range return period, or null when it is a whole 0–30 days. */
export function returnPeriodError(days: number): string | null {
  if (!Number.isInteger(days) || days < 0 || days > MAX_RETURN_PERIOD_DAYS) {
    return `Rückgabefrist muss zwischen 0 und ${MAX_RETURN_PERIOD_DAYS} Tagen liegen.`
  }
  return null
}

/** Colour/size pairs that appear on more than one variant row, each reported once. */
export function duplicateVariants<T extends { color: string; size: string }>(
  rows: T[],
): { color: string; size: string }[] {
  const seen = new Set<string>()
  const dupes = new Map<string, { color: string; size: string }>()
  for (const { color, size } of rows) {
    const key = `${color}|${size}`
    if (seen.has(key)) dupes.set(key, { color, size })
    seen.add(key)
  }
  return [...dupes.values()]
}
