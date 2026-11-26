// Pure checkout pricing math, extracted from app/(root)/checkout/page.tsx so it can be unit
// tested in isolation. These functions decide nothing the server doesn't re-verify — the
// backend is the source of truth for money. Keep this free of React / side effects.

/** The backend's GLOBAL_DEFAULT shipping rate, charged once per brand in the order. */
export const STANDARD_SHIPPING = 5

/**
 * Pre-address placeholder only. The backend prices shipping per brand
 * (GLOBAL_DEFAULT / BRAND_FLAT_RATE / BRAND_FREE_SHIPPING) and POST /orders/preview is the
 * authoritative answer the moment an address exists — this is what the summary shows before
 * then. It mirrors the default rule, one rate per brand, so a multi-brand cart does not jump
 * from one shipping line to several at checkout. A brand's own flat or free rate can still move
 * the confirmed figure. There is deliberately no order-value free-shipping threshold: the backend
 * has no such rule, and promising one the checkout will not honour is worse than an estimate.
 */
export function estimateShipping(items: { brand: string }[]): number {
  return new Set(items.map(i => i.brand)).size * STANDARD_SHIPPING
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
