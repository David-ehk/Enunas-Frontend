// The post-purchase "Exklusiv für dich" offer. The backend decides eligibility, product,
// deadline and discount; this file only holds the rules for rendering its answer.
import type { ApiListing, ApiProductVariant, ApiOrder, LiveOffer, UpsellOfferResult } from '@/types/api'
import { listingPriceView } from './pricing'

const RETRIES = 3
const RETRY_DELAY_MS = 3000

/**
 * 'pending' is re-asked a few times while the payment webhook may still be on its way. Errors
 * (403, 404, …) resolve to null: render nothing.
 */
export async function requestUpsellOffer(
  post: () => Promise<UpsellOfferResult>,
  {
    wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)),
    isCancelled = () => false,
  }: { wait?: (ms: number) => Promise<void>; isCancelled?: () => boolean } = {},
): Promise<LiveOffer | null> {
  try {
    for (let attempt = 0; ; attempt += 1) {
      const result = await post()
      if (result !== 'pending') return result
      if (attempt === RETRIES) return null
      await wait(RETRY_DELAY_MS)
      if (isCancelled()) return null
    }
  } catch {
    return null
  }
}

export function msLeft(deadline: number, now: number = performance.now()): number {
  return Math.max(0, deadline - now)
}

export function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// Carries the accepted offer from /angebot to the checkout, and through a failed payment. Only
// the id: expiry, ownership and product are checked by the backend on every preview and order.
const APPLIED_OFFER_STORAGE_KEY = 'enunas_upsell_offer'

type ReadWriteStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function rememberAppliedOffer(offerId: number, storage?: ReadWriteStorage): void {
  try {
    ;(storage ?? sessionStorage).setItem(APPLIED_OFFER_STORAGE_KEY, String(offerId))
  } catch {
    // Storage unavailable — the checkout then shows full prices.
  }
}

export function readAppliedOffer(storage?: ReadWriteStorage): number | null {
  try {
    const id = Number((storage ?? sessionStorage).getItem(APPLIED_OFFER_STORAGE_KEY))
    return Number.isInteger(id) && id > 0 ? id : null
  } catch {
    return null
  }
}

export function forgetAppliedOffer(offerId: number, storage?: ReadWriteStorage): void {
  try {
    if (readAppliedOffer(storage) === offerId) {
      ;(storage ?? sessionStorage).removeItem(APPLIED_OFFER_STORAGE_KEY)
    }
  } catch {
    // Nothing stored that could be removed.
  }
}

export function orderDiscountLabel(order: Pick<ApiOrder, 'upsellOfferId' | 'discountCode'>): string {
  if (order.upsellOfferId != null) return 'Exklusiv-Rabatt'
  return order.discountCode ? `Rabatt (${order.discountCode})` : 'Rabatt'
}

/**
 * A preview that includes an offer discount is outdated once that offer is no longer applied.
 */
export function currentPreview<T extends { upsellOfferId?: number | null }>(
  preview: T | null,
  appliedOfferId: number | null,
): T | null {
  if (preview?.upsellOfferId != null && preview.upsellOfferId !== appliedOfferId) return null
  return preview
}

export interface OfferSizeOption {
  variant: ApiProductVariant
  listing: ApiListing
}

/** Every size of the offered listing's colourway that has a listing of its own. */
export function offerSizeOptions(
  variants: ApiProductVariant[],
  listings: ApiListing[],
  offeredListingId: number,
): OfferSizeOption[] {
  const variantOf = (l: ApiListing) =>
    variants.find(v => (l.variantId != null ? v.id === l.variantId : v.sku === l.variantSku))
  const offeredListing = listings.find(l => Number(l.id) === offeredListingId)
  const color = offeredListing && variantOf(offeredListing)?.color
  if (!color) return []

  return variants
    .filter(v => v.color === color)
    .flatMap(v => {
      // The offered listing wins over any other listing of its variant (e.g. another region).
      const own = listings.filter(l => l.active !== false && variantOf(l)?.id === v.id)
      const listing = own.find(l => Number(l.id) === offeredListingId) ?? own[0]
      return listing ? [{ variant: v, listing }] : []
    })
}

/**
 * One unit's price pair for the chosen size. The API's figures are for the offered listing; a
 * size priced differently gets the same percent on its own price. The checkout preview is final.
 */
export function offerPriceForListing(
  offer: LiveOffer,
  listing: ApiListing,
): { listPrice: number; offerPrice: number } {
  const current = listingPriceView(listing).current
  if (Number(listing.id) === offer.listingId || current === offer.listPrice) {
    return { listPrice: offer.listPrice, offerPrice: offer.offerPrice }
  }
  return {
    listPrice: current,
    offerPrice: Math.round(current * (100 - offer.percent)) / 100,
  }
}
