// Platform return-window policy. Products still carry their own returnPeriodDays (and the wizard
// still sends it), so a per-product window can come back later by widening this range — e.g.
// MIN 0 / MAX 30 restores the old brand-chosen behaviour without touching any caller.
export const MIN_RETURN_PERIOD_DAYS = 14
export const MAX_RETURN_PERIOD_DAYS = 14

/** The return window to promise the customer: the product's own value, held to the policy range. */
export function effectiveReturnPeriodDays(days: number | null | undefined): number {
  const stored = days ?? MAX_RETURN_PERIOD_DAYS
  return Math.min(MAX_RETURN_PERIOD_DAYS, Math.max(MIN_RETURN_PERIOD_DAYS, stored))
}
