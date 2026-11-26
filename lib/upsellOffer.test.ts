import { describe, it, expect, vi } from 'vitest'
import {
  requestUpsellOffer,
  msLeft,
  formatCountdown,
  rememberAppliedOffer,
  readAppliedOffer,
  forgetAppliedOffer,
  orderDiscountLabel,
  offerSizeOptions,
  offerPriceForListing,
  currentPreview,
} from './upsellOffer'
import type { ApiListing, ApiProductVariant, LiveOffer } from '@/types/api'

const offered = {
  offerId: 123, percent: 10, listingId: 456, listPrice: 420, offerPrice: 378, deadline: 0,
} as LiveOffer

describe('requestUpsellOffer', () => {
  const noWait = () => Promise.resolve()

  it('gives up after 3 retries, 3 s apart, while the answer stays not eligible (flag off)', async () => {
    const post = vi.fn().mockResolvedValue('pending')
    const wait = vi.fn(noWait)
    expect(await requestUpsellOffer(post, { wait })).toBeNull()
    expect(post).toHaveBeenCalledTimes(4)
    expect(wait.mock.calls).toEqual([[3000], [3000], [3000]])
  })

  it('returns the offer that appears once the payment webhook has landed', async () => {
    const post = vi.fn().mockResolvedValueOnce('pending').mockResolvedValue(offered)
    expect(await requestUpsellOffer(post, { wait: noWait })).toEqual(offered)
    expect(post).toHaveBeenCalledTimes(2)
  })

  it('does not retry a final "no offer"', async () => {
    const post = vi.fn().mockResolvedValue(null)
    expect(await requestUpsellOffer(post, { wait: noWait })).toBeNull()
    expect(post).toHaveBeenCalledTimes(1)
  })

  it('resolves to nothing, without retrying, on an error such as 403 or 404', async () => {
    const post = vi.fn().mockRejectedValue(new Error('403'))
    expect(await requestUpsellOffer(post, { wait: noWait })).toBeNull()
    expect(post).toHaveBeenCalledTimes(1)
  })

  it('stops retrying once the page is gone', async () => {
    let gone = false
    const post = vi.fn().mockResolvedValue('pending')
    const wait = async () => { gone = true }
    await requestUpsellOffer(post, { wait, isCancelled: () => gone })
    expect(post).toHaveBeenCalledTimes(1)
  })
})

describe('countdown', () => {
  it('never goes below zero', () => {
    expect(msLeft(1000, 10_000_000)).toBe(0)
    expect(msLeft(602_000, 65_000)).toBe(537_000)
  })

  it('formats as mm:ss, reaching 00:00 only when the time is really up', () => {
    expect(formatCountdown(597_000)).toBe('09:57')
    expect(formatCountdown(500)).toBe('00:01')
    expect(formatCountdown(0)).toBe('00:00')
  })
})

describe('currentPreview', () => {
  const discounted = { upsellOfferId: 123, total: 383 }
  const full = { upsellOfferId: null, total: 425 }

  it('hides a discounted preview once its offer is no longer applied', () => {
    expect(currentPreview(discounted, null)).toBeNull()
  })

  it('shows the discounted preview while the offer is applied', () => {
    expect(currentPreview(discounted, 123)).toBe(discounted)
  })

  it('keeps an undiscounted preview, such as one that rejected the offer', () => {
    expect(currentPreview(full, null)).toBe(full)
    expect(currentPreview(null, 123)).toBeNull()
  })
})

describe('applied offer hand-off', () => {
  function memoryStorage() {
    const data = new Map<string, string>()
    return {
      data,
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => { data.set(k, v) },
      removeItem: (k: string) => { data.delete(k) },
    }
  }

  it('carries only the offer id, no deadline', () => {
    const s = memoryStorage()
    rememberAppliedOffer(123, s)
    expect(readAppliedOffer(s)).toBe(123)
    expect([...s.data.values()]).toEqual(['123'])
  })

  it('forgets only the offer it is asked about', () => {
    const s = memoryStorage()
    rememberAppliedOffer(123, s)
    forgetAppliedOffer(999, s)
    expect(readAppliedOffer(s)).toBe(123)
    forgetAppliedOffer(123, s)
    expect(readAppliedOffer(s)).toBeNull()
  })

  it('ignores junk and unavailable storage', () => {
    const s = memoryStorage()
    s.setItem('enunas_upsell_offer', 'abc')
    expect(readAppliedOffer(s)).toBeNull()
    const broken = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('blocked') },
      removeItem: () => { throw new Error('blocked') },
    }
    expect(readAppliedOffer(broken)).toBeNull()
    expect(() => rememberAppliedOffer(1, broken)).not.toThrow()
    expect(() => forgetAppliedOffer(1, broken)).not.toThrow()
  })
})

describe('orderDiscountLabel', () => {
  it('names an offer discount "Exklusiv-Rabatt", never a code', () => {
    expect(orderDiscountLabel({ upsellOfferId: 123, discountCode: undefined })).toBe('Exklusiv-Rabatt')
  })

  it('keeps the code label for code discounts', () => {
    expect(orderDiscountLabel({ upsellOfferId: null, discountCode: 'SAVE20' })).toBe('Rabatt (SAVE20)')
    expect(orderDiscountLabel({})).toBe('Rabatt')
  })
})

describe('offer sizes', () => {
  const variant = (id: number, color: string, size: string, stockQuantity: number): ApiProductVariant =>
    ({ id, sku: `SKU-${id}`, color, size, stockQuantity })
  const listing = (id: number, variantId: number, price = 420, extra: Partial<ApiListing> = {}) =>
    ({ id: String(id), variantId, price, createdAt: '', ...extra }) as ApiListing

  const variants = [
    variant(1, 'BLACK', 'S', 3),
    variant(2, 'BLACK', 'M', 2),
    variant(3, 'BLACK', 'L', 0),
    variant(4, 'WHITE', 'XL', 5),
    variant(5, 'BLACK', 'XXL', 4),
  ]
  const listings = [listing(455, 1), listing(456, 2), listing(457, 3), listing(458, 4), listing(459, 5, 420, { active: false })]

  it('offers the buyable sizes of the offered colourway, each with its own listing', () => {
    const options = offerSizeOptions(variants, listings, 456)
    // Each option carries its own variant, so no caller has to match them up again.
    expect(options.map(o => [o.variant.size, o.listing.id, o.variant.stockQuantity])).toEqual([
      ['S', '455', 3],
      ['M', '456', 2],
      ['L', '457', 0],
    ])
  })

  it('offers nothing when the offered listing is not among the listings', () => {
    expect(offerSizeOptions(variants, listings, 999)).toEqual([])
  })

  it('quotes the API prices for the offered listing and same-priced sizes', () => {
    expect(offerPriceForListing(offered, listing(456, 2))).toEqual({ listPrice: 420, offerPrice: 378 })
    expect(offerPriceForListing(offered, listing(455, 1))).toEqual({ listPrice: 420, offerPrice: 378 })
  })

  it('applies the percent to a size that is priced differently', () => {
    expect(offerPriceForListing(offered, listing(455, 1, 500))).toEqual({ listPrice: 500, offerPrice: 450 })
  })
})
