// Pure cart reducers + totals, extracted from app/context/CartContext.tsx so the dedup and
// money math can be unit tested without rendering React. The provider wires its setState
// calls to these. Behaviour must stay identical to the original inline logic.
import type { CartItem } from '@/app/context/CartContext'

/** Sum of quantities across all line items. */
export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0)
}

/** Sum of price × quantity across all line items. */
export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

/** Identity of a line item: same product + size + colour collapses onto one line. */
export function cartDedupKey(item: Pick<CartItem, 'productId' | 'size' | 'color'>): string {
  return `${item.productId}-${item.size}-${item.color?.id || 'default'}`
}

/**
 * Add an item: if a matching line (same productId+size+colour) exists, bump its quantity;
 * otherwise append a new line. `idSuffix` is injectable so tests can be deterministic — the
 * provider uses the default (timestamp), matching the original behaviour.
 */
export function addItem(
  items: CartItem[],
  item: Omit<CartItem, 'id' | 'quantity'>,
  idSuffix: () => string = () => String(Date.now()),
): CartItem[] {
  // The cart persists in localStorage and every entry point funnels through here, so the
  // sold-out gate belongs at this level rather than in each caller. Unknown stock (undefined)
  // is not a limit — only a real number constrains the line.
  if (item.stockQuantity === 0) return items

  const existing = items.find(
    i => i.productId === item.productId && i.size === item.size && i.color?.id === item.color?.id,
  )
  if (existing) {
    const limit = item.stockQuantity ?? existing.stockQuantity
    if (limit !== undefined && existing.quantity >= limit) return items
    return items.map(i => (i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i))
  }
  const newItem: CartItem = {
    ...item,
    id: `${cartDedupKey(item)}-${idSuffix()}`,
    quantity: 1,
  }
  return [...items, newItem]
}

/** Set a line's quantity; quantity ≤ 0 removes the line, and stock caps the upper end. */
export function updateQty(items: CartItem[], itemId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return items.filter(i => i.id !== itemId)
  return items.map(i => {
    if (i.id !== itemId) return i
    const capped = i.stockQuantity !== undefined ? Math.min(quantity, i.stockQuantity) : quantity
    return { ...i, quantity: capped }
  })
}

/** Remove a line by id. */
export function removeItem(items: CartItem[], itemId: string): CartItem[] {
  return items.filter(i => i.id !== itemId)
}
