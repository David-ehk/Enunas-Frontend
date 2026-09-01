// Pure checkout pricing math, extracted from app/(root)/checkout/page.tsx so it can be unit
// tested in isolation. These functions decide nothing the server doesn't re-verify — the
// only live discount code (UPSELL10) is auto-attached and the backend is the source of truth
// for money. Keep this free of React / side effects.

export const STANDARD_SHIPPING = 4.99

/**
 * Pre-address placeholder only. The backend prices shipping per brand
 * (GLOBAL_DEFAULT / BRAND_FLAT_RATE / BRAND_FREE_SHIPPING) and POST /orders/preview is the
 * authoritative answer the moment an address exists — this is what the summary shows before
 * then. There is deliberately no order-value free-shipping threshold: the backend has no such
 * rule, and promising one the checkout will not honour is worse than a flat estimate.
 */
export function calcShipping(_subtotal: number): number {
  return STANDARD_SHIPPING
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
