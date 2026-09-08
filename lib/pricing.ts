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
// The param is kept so the call signature stays stable: the real backend prices shipping by
// subtotal/brand, and POST /orders/preview is authoritative once an address exists.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

/**
 * The price pair for one listing, i.e. one product variant.
 *
 * The backend now computes this pair itself and returns it as currentPrice/originalPrice, with
 * the same convention as ProductResponseDto: originalPrice non-null IS the "on sale" signal.
 * That is the authority — it owns the rule, including anything the client cannot see (the
 * availableFrom/availableUntil and dropDate windows the listing also carries).
 *
 * The local fallback below only runs when a response predates those fields. It mirrors
 * ProductListing.getCurrentPrice(): a discountPrice counts only when present AND greater than
 * zero, because a zero discount is not a sale and would otherwise charge nothing.
 *
 * Either way both numbers come from the SAME listing row. The pairing hazard lives in
 * aggregating across listings — for that case use the product-level price/originalPrice.
 */
export function listingPriceView(
  listing: {
    price: number
    discountPrice?: number | null
    currentPrice?: number
    originalPrice?: number | null
  },
): { current: number; original: number | null } {
  const { price, discountPrice, currentPrice, originalPrice } = listing

  if (currentPrice != null) {
    return { current: currentPrice, original: originalPrice ?? null }
  }

  if (discountPrice != null && discountPrice > 0) {
    return { current: discountPrice, original: price }
  }
  return { current: price, original: null }
}

/**
 * What the /angebot promo page should quote for a product.
 *
 * `price` is the effective price the shop charges — already the markdown when a sale is running
 * — and `originalPrice` is that sale's pre-discount figure (non-null is itself the "on sale"
 * signal). The promo is quoted off the undiscounted list price, and it deliberately does NOT
 * compound on top of a markdown the shop is already running: doing so quotes a saving the
 * customer was never meant to get, and UPSELL10 is applied by the backend against the cart
 * subtotal, so a stacked promo silently under-charges.
 *
 * - Not on sale → promo = price − pct, struck through with `price` (unchanged behaviour).
 * - Already on sale → promo = the shop's own sale price, struck through with the real
 *   `originalPrice`. The strike-through is then the genuine list price rather than a markdown
 *   mislabelled as one.
 */
export function resolvePromoPricing(
  price: number,
  originalPrice: number | null | undefined,
  discountPct: number,
): { promoPrice: number; listPrice: number; alreadyReduced: boolean } {
  const alreadyReduced = originalPrice != null
  const listPrice = alreadyReduced ? originalPrice : price
  const promoPrice = alreadyReduced
    ? price
    : Math.round(price * (1 - discountPct / 100) * 100) / 100
  return { promoPrice, listPrice, alreadyReduced }
}

/** subtotal + shipping − discount. */
export function calcFinalTotal(subtotal: number, shipping: number, discount: number): number {
  return subtotal + shipping - discount
}
