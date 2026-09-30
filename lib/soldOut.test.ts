import { describe, it, expect } from 'vitest'
import { isSoldOut, variantsToSellOut, restockQuantity } from './soldOut'

const v = (id: string, stockQuantity?: number) => ({ id, stockQuantity })

describe('isSoldOut', () => {
  it('is true when every variant has zero stock', () => {
    expect(isSoldOut([v('1', 0), v('2', 0)])).toBe(true)
  })

  it('is false while any variant still has stock', () => {
    expect(isSoldOut([v('1', 0), v('2', 3)])).toBe(false)
  })

  it('is false for a product without variants (nothing was ever stocked)', () => {
    expect(isSoldOut([])).toBe(false)
  })

  it('treats a missing stock figure as zero', () => {
    expect(isSoldOut([v('1', undefined), v('2', 0)])).toBe(true)
  })
})

describe('variantsToSellOut', () => {
  it('returns only the variants that still have stock, so nothing is updated needlessly', () => {
    expect(variantsToSellOut([v('1', 0), v('2', 4), v('3', 1)]).map(x => x.id)).toEqual(['2', '3'])
  })

  it('returns nothing when everything is already sold out', () => {
    expect(variantsToSellOut([v('1', 0), v('2', 0)])).toEqual([])
  })
})

describe('restockQuantity', () => {
  it('brings back the stock a variant had before it was sold out', () => {
    expect(restockQuantity(7)).toBe(7)
  })

  it('falls back to one piece when the earlier stock is unknown or zero', () => {
    expect(restockQuantity(undefined)).toBe(1)
    expect(restockQuantity(0)).toBe(1)
  })
})
