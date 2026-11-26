import { describe, it, expect } from 'vitest'
import { estimateShipping, listingPriceView, STANDARD_SHIPPING } from './pricing'

describe('estimateShipping', () => {
  it('matches the backend GLOBAL_DEFAULT rate (5.00 per brand in order snapshots, 14 Sep 2026)', () => {
    expect(STANDARD_SHIPPING).toBe(5)
  })

  it('charges one rate per brand, like the backend does', () => {
    // ENS-2026-4L7JX2: 3 items from 2 brands was priced 2 × 5.00 at checkout, while the
    // old flat estimate showed a single 4.99 line until the address was confirmed.
    const cart = [
      { brand: 'Claude Testmarke 0109' },
      { brand: 'Claude Testmarke 0109B' },
      { brand: 'Claude Testmarke 0109B' },
    ]
    expect(estimateShipping(cart)).toBe(10)
  })

  it('charges a single rate for several items from the same brand', () => {
    expect(estimateShipping([{ brand: 'A' }, { brand: 'A' }])).toBe(STANDARD_SHIPPING)
  })

  it('charges nothing for an empty cart', () => {
    expect(estimateShipping([])).toBe(0)
  })
})

describe('listingPriceView', () => {
  it('prefers the server-computed pair when the backend sends one', () => {
    expect(listingPriceView({ price: 149.95, discountPrice: 119.95, currentPrice: 119.95, originalPrice: 149.95 }))
      .toEqual({ current: 119.95, original: 149.95 })
    expect(listingPriceView({ price: 99.95, currentPrice: 99.95, originalPrice: null }))
      .toEqual({ current: 99.95, original: null })
  })

  it('lets the server pair win even where the local rule would disagree', () => {
    // The backend can see things the client cannot — availableFrom/Until and dropDate windows —
    // so a discountPrice that is set but not currently in effect must not resurrect a sale.
    expect(listingPriceView({ price: 149.95, discountPrice: 119.95, currentPrice: 149.95, originalPrice: null }))
      .toEqual({ current: 149.95, original: null })
  })

  it('treats a positive discountPrice as the sale, striking the listing price', () => {
    expect(listingPriceView({ price: 149.95, discountPrice: 119.95 }))
      .toEqual({ current: 119.95, original: 149.95 })
  })

  it('is not a sale without a discountPrice', () => {
    expect(listingPriceView({ price: 89.95 })).toEqual({ current: 89.95, original: null })
    expect(listingPriceView({ price: 89.95, discountPrice: null }))
      .toEqual({ current: 89.95, original: null })
  })

  it('does not treat a zero discount as a sale', () => {
    // Mirrors ProductListing.getCurrentPrice(): without the > 0 test this would charge €0,00
    // and strike the real price through.
    expect(listingPriceView({ price: 89.95, discountPrice: 0 }))
      .toEqual({ current: 89.95, original: null })
  })
})
