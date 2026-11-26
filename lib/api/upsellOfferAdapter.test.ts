import { describe, it, expect, vi } from 'vitest'
import { toUpsellOffer, type UpsellOfferResponse } from './upsellOfferAdapter'
import type { RawProductResponse } from './productResponseAdapter'
import type { LiveOffer } from '@/types/api'

const product = {
  id: 7, name: 'Jacke', slug: 'jacke', price: 420, brandName: 'Marke', status: 'ACTIVE', createdAt: '',
} as RawProductResponse

const offered: UpsellOfferResponse = {
  eligible: true,
  offerId: 123,
  status: 'OFFERED',
  percent: 10,
  expiresAt: '2026-11-26T14:10:00Z',
  serverNow: '2026-11-26T14:00:03Z',
  product,
  listingId: 456,
  listPrice: 420,
  offerPrice: 378,
}

const live = (response: UpsellOfferResponse, receivedAt = 5000) => toUpsellOffer(response, receivedAt) as LiveOffer

describe('toUpsellOffer', () => {
  it('turns an open offer into a complete one with an adapted product', () => {
    expect(live(offered)).toMatchObject({
      offerId: 123, percent: 10, listingId: 456, listPrice: 420, offerPrice: 378,
      product: { id: '7', name: 'Jacke', brandName: 'Marke' },
    })
  })

  it('sets the deadline from server time on the monotonic clock, whatever the browser clock says', () => {
    // 14:10:00 − 14:00:03 = 597 s after the response arrived at monotonic time 5000.
    vi.useFakeTimers()
    try {
      for (const skewedNow of ['2026-11-26T13:55:00Z', '2026-11-26T14:05:00Z']) {
        vi.setSystemTime(new Date(skewedNow))
        expect(live(offered).deadline).toBe(602_000)
      }
    } finally {
      vi.useRealTimers()
    }
  })

  it('has no time left when the status is EXPIRED', () => {
    expect(live({ ...offered, status: 'EXPIRED' }).deadline).toBe(5000)
  })

  it('is nothing when the product was deleted or taken off the storefront', () => {
    expect(toUpsellOffer({ ...offered, product: null }, 0)).toBeNull()
  })

  it.each(['REDEEMED', 'NOT_ELIGIBLE'] as const)('is nothing for %s', (status) => {
    expect(toUpsellOffer({ ...offered, status }, 0)).toBeNull()
  })

  it.each(['offerId', 'percent', 'expiresAt', 'serverNow', 'listingId', 'listPrice', 'offerPrice'] as const)(
    'is nothing, never a half-filled offer, when %s is missing',
    (field) => {
      expect(toUpsellOffer({ ...offered, [field]: undefined }, 0)).toBeNull()
    },
  )

  it('is pending while not eligible, because the payment may not have landed yet', () => {
    expect(toUpsellOffer({ eligible: false }, 0)).toBe('pending')
  })

  it('treats a lost roll as final', () => {
    expect(toUpsellOffer({ eligible: false, status: 'NOT_ELIGIBLE' }, 0)).toBeNull()
  })
})
