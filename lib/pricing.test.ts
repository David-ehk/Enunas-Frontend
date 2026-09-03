import { describe, it, expect } from 'vitest'
import { calcShipping, calcUpsellDiscount, calcFinalTotal, listingPriceView, resolvePromoPricing, STANDARD_SHIPPING } from './pricing'

describe('calcShipping', () => {
  it('charges the flat rate regardless of order value — there is no free-shipping threshold', () => {
    expect(calcShipping(10)).toBe(STANDARD_SHIPPING)
    expect(calcShipping(50)).toBe(STANDARD_SHIPPING)
    expect(calcShipping(500)).toBe(STANDARD_SHIPPING)
  })
})

describe('calcUpsellDiscount', () => {
  it('applies 10% for UPSELL10, rounded to cents', () => {
    expect(calcUpsellDiscount(49.95, 'UPSELL10')).toBe(5)      // 4.995 -> 5.00
    expect(calcUpsellDiscount(33.33, 'UPSELL10')).toBe(3.33)
  })

  it('is case- and whitespace-insensitive', () => {
    expect(calcUpsellDiscount(100, '  upsell10 ')).toBe(10)
  })

  it('gives no discount for any other or empty code', () => {
    expect(calcUpsellDiscount(100, 'SAVE20')).toBe(0)
    expect(calcUpsellDiscount(100, '')).toBe(0)
  })
})

describe('calcFinalTotal', () => {
  it('is subtotal + shipping − discount', () => {
    expect(calcFinalTotal(49.95, 4.99, 0)).toBeCloseTo(54.94, 2)
    expect(calcFinalTotal(100, 0, 10)).toBe(90)
  })
})

describe('resolvePromoPricing', () => {
  it('takes the pct off the list price when the product is not on sale', () => {
    const r = resolvePromoPricing(149.95, null, 10)
    expect(r.promoPrice).toBe(134.95)
    expect(r.listPrice).toBe(149.95)
    expect(r.alreadyReduced).toBe(false)
  })

  it('does not stack on an existing markdown, and strikes the real list price', () => {
    // 119.95 is already reduced from 149.95. Quoting 119.95 * 0.9 = 107.96 would advertise —
    // and, via UPSELL10 against the cart subtotal, actually charge — a compounded discount.
    const r = resolvePromoPricing(119.95, 149.95, 10)
    expect(r.promoPrice).toBe(119.95)
    expect(r.listPrice).toBe(149.95)
    expect(r.alreadyReduced).toBe(true)
  })

  it('treats undefined originalPrice as not on sale', () => {
    expect(resolvePromoPricing(100, undefined, 10).promoPrice).toBe(90)
  })

  it('rounds to cents', () => {
    expect(resolvePromoPricing(33.33, null, 10).promoPrice).toBe(30)
    expect(resolvePromoPricing(49.95, null, 10).promoPrice).toBe(44.96)
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
