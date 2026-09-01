import { describe, it, expect } from 'vitest'
import { calcShipping, calcUpsellDiscount, calcFinalTotal, STANDARD_SHIPPING } from './pricing'

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
