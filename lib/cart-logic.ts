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
  const existing = items.find(
    i => i.productId === item.productId && i.size === item.size && i.color?.id === item.color?.id,
  )
  if (existing) {
    return items.map(i => (i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i))
  }
  const newItem: CartItem = {
    ...item,
    id: `${cartDedupKey(item)}-${idSuffix()}`,
    quantity: 1,
  }
  return [...items, newItem]
}

/** Set a line's quantity; quantity ≤ 0 removes the line. */
export function updateQty(items: CartItem[], itemId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return items.filter(i => i.id !== itemId)
  return items.map(i => (i.id === itemId ? { ...i, quantity } : i))
}

/** Remove a line by id. */
export function removeItem(items: CartItem[], itemId: string): CartItem[] {
  return items.filter(i => i.id !== itemId)
}
