/**
 * Brand-side shop controls. A brand takes a released product out of the shop by switching all its
 * listings off: without an active listing it leaves the product lists and its page returns 404
 * (verified against production, 26 Nov 2026). Coming-soon products stay listed either way.
 */
interface SwitchableListing {
  active?: boolean
}

export type ShopState = 'active' | 'inactive' | 'no-listing'

export function shopState(listings: SwitchableListing[]): ShopState {
  if (listings.length === 0) return 'no-listing'
  return listings.some(l => l.active !== false) ? 'active' : 'inactive'
}

/** The listings that still have to change to reach `active`. */
export function listingsToSwitch<T extends SwitchableListing>(listings: T[], active: boolean): T[] {
  return listings.filter(l => (l.active !== false) !== active)
}

/** The restock form's input (variant id → typed quantity) as updates; only whole numbers above 0. */
export function restockUpdates(quantities: Record<string, string>): { id: string; stockQuantity: number }[] {
  return Object.entries(quantities).flatMap(([id, typed]) => {
    const stockQuantity = Number(typed.trim())
    return Number.isInteger(stockQuantity) && stockQuantity > 0 ? [{ id, stockQuantity }] : []
  })
}
