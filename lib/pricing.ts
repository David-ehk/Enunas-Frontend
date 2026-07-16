// Pure checkout pricing math, extracted from app/(root)/checkout/page.tsx so it can be unit
// tested in isolation. These functions decide nothing the server doesn't re-verify — the
// only live discount code (UPSELL10) is auto-attached and the backend is the source of truth
// for money. Keep this free of React / side effects.

export const FREE_SHIPPING_THRESHOLD = 50
export const STANDARD_SHIPPING = 4.99

/** Free shipping at or above the threshold, otherwise the flat standard rate. */
export function calcShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING
}

/**
 * The only client-known discount: UPSELL10 = 10% off the subtotal, rounded to cents.
 * Case- and whitespace-insensitive. Any other code yields no discount.
 */
export function calcUpsellDiscount(subtotal: number, code: string): number {
  return code.trim().toUpperCase() === 'UPSELL10'
    ? Math.round(subtotal * 0.1 * 100) / 100
    : 0
}

/** subtotal + shipping − discount. */
export function calcFinalTotal(subtotal: number, shipping: number, discount: number): number {
  return subtotal + shipping - discount
}
