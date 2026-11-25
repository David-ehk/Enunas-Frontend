import { MIN_RETURN_PERIOD_DAYS, MAX_RETURN_PERIOD_DAYS } from './returnPolicy'

export { MIN_RETURN_PERIOD_DAYS, MAX_RETURN_PERIOD_DAYS }

/** Error message for an out-of-range return period, or null when it is a whole day count in policy range. */
export function returnPeriodError(days: number): string | null {
  if (!Number.isInteger(days) || days < MIN_RETURN_PERIOD_DAYS || days > MAX_RETURN_PERIOD_DAYS) {
    return MIN_RETURN_PERIOD_DAYS === MAX_RETURN_PERIOD_DAYS
      ? `Rückgabefrist beträgt ${MAX_RETURN_PERIOD_DAYS} Tage.`
      : `Rückgabefrist muss zwischen ${MIN_RETURN_PERIOD_DAYS} und ${MAX_RETURN_PERIOD_DAYS} Tagen liegen.`
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
