// The one place the upsell-offer response is checked. Past this point an offer is complete.
import type { UpsellOfferResult } from '@/types/api'
import { adaptProduct, type RawProductResponse } from './productResponseAdapter'

// Wire shape of POST/GET /orders/{orderNumber}/upsell-offer. `eligible: false` may come alone.
export interface UpsellOfferResponse {
  eligible: boolean
  offerId?: number
  status?: 'OFFERED' | 'EXPIRED' | 'REDEEMED' | 'NOT_ELIGIBLE'
  percent?: number
  expiresAt?: string
  serverNow?: string
  /** Full ProductResponseDto; null once the product is deleted or off the storefront. */
  product?: RawProductResponse | null
  listingId?: number
  // Both are for ONE unit of listingId.
  listPrice?: number
  offerPrice?: number
}

/**
 * `receivedAt` is the monotonic time the response arrived. The deadline is counted from it using
 * the server's two timestamps only, so a skewed browser clock cannot move it.
 */
export function toUpsellOffer(
  response: UpsellOfferResponse,
  receivedAt: number = performance.now(),
): UpsellOfferResult {
  const { eligible, status, offerId, percent, product, listingId, listPrice, offerPrice } = response
  // Not eligible can mean the payment webhook has not landed yet. A lost roll is final.
  if (!eligible) return status === 'NOT_ELIGIBLE' ? null : 'pending'

  const remaining = Date.parse(response.expiresAt ?? '') - Date.parse(response.serverNow ?? '')
  if (
    (status !== 'OFFERED' && status !== 'EXPIRED') || !product || !Number.isFinite(remaining) ||
    offerId == null || percent == null || listingId == null || listPrice == null || offerPrice == null
  ) return null

  return {
    offerId, percent, listingId, listPrice, offerPrice,
    product: adaptProduct(product),
    deadline: receivedAt + (status === 'EXPIRED' ? 0 : Math.max(0, remaining)),
  }
}
