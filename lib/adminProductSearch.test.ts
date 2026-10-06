import { describe, it, expect } from 'vitest'
import { matchesProductSearch } from './adminProductSearch'

// Admin products as production returned them on 30 Sep 2026: no `sku` on the product itself
// (SKUs live on variants), which crashed the admin search on the first keystroke.
const noSku = { name: 'E2E-0930 Colour Hoodie', brandName: 'Claude Testmarke 0109' }

describe('matchesProductSearch', () => {
  it('does not throw when the product has no sku', () => {
    expect(() => matchesProductSearch(noSku, 'e2e')).not.toThrow()
  })

  it('matches on name, case-insensitively', () => {
    expect(matchesProductSearch(noSku, 'COLOUR hood')).toBe(true)
  })

  it('matches on brand name', () => {
    expect(matchesProductSearch(noSku, 'testmarke')).toBe(true)
  })

  it('matches on sku when present', () => {
    expect(matchesProductSearch({ ...noSku, sku: 'E2E-P1-BLK' }, 'p1-blk')).toBe(true)
  })

  it('rejects a query that matches nothing', () => {
    expect(matchesProductSearch(noSku, 'zzz')).toBe(false)
  })

  it('matches everything for an empty query', () => {
    expect(matchesProductSearch({ name: 'x', brandName: null }, '')).toBe(true)
  })

  it('does not throw when the brand name is missing', () => {
    expect(matchesProductSearch({ name: 'Hoodie', brandName: null }, 'hood')).toBe(true)
  })
})
