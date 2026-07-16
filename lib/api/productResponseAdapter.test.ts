import { describe, it, expect } from 'vitest'
import { adaptProduct, type RawProductResponse } from './productResponseAdapter'

function raw(overrides: Partial<RawProductResponse> = {}): RawProductResponse {
  return {
    id: 1,
    name: 'Waterfall',
    slug: 'waterfall',
    price: 49.95,
    brandName: 'Test Brand',
    category: 'CLOTHING',
    catalogueCategory: ['STREETWEAR', 'CULTURAL'],
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    variants: [
      { id: 1, sku: 'SKU-1', color: 'Blue', colorFamily: 'BLUE', size: 'M', stockQuantity: 5 },
      { id: 2, sku: 'SKU-2', color: 'Blue', colorFamily: 'BLUE', size: 'L', stockQuantity: 3 },
      { id: 3, sku: 'SKU-3', color: 'Black', colorFamily: 'BLACK', size: 'S', stockQuantity: 2 },
    ],
    images: [
      { id: 1, imageUrl: 'b.jpg', primary: false, displayOrder: 2 },
      { id: 2, imageUrl: 'a.jpg', primary: true, displayOrder: 1 },
      { id: 3, imageUrl: 'c.jpg', primary: false, displayOrder: 1 },
    ],
    ...overrides,
  }
}

describe('adaptProduct', () => {
  it('flattens distinct colours by name in first-seen order with hex mapping', () => {
    const p = adaptProduct(raw())
    expect(p.colours.map(c => c.name)).toEqual(['Blue', 'Black'])
    expect(p.colours.map(c => c.hex)).toEqual(['#2B4B8C', '#0A0A0A'])
  })

  it('falls back to #6B6B6B for an unknown colorFamily', () => {
    const p = adaptProduct(raw({
      variants: [{ id: 9, sku: 'S', color: 'Fuchsia', colorFamily: 'NEON', size: 'M', stockQuantity: 1 }],
    }))
    expect(p.colours[0].hex).toBe('#6B6B6B')
  })

  it('produces distinct sizes in first-seen order', () => {
    expect(adaptProduct(raw()).sizes).toEqual(['M', 'L', 'S'])
  })

  it('sorts images primary-first then by displayOrder', () => {
    expect(adaptProduct(raw()).images).toEqual(['a.jpg', 'c.jpg', 'b.jpg'])
  })

  it('passes through price and coalesces null to 0', () => {
    expect(adaptProduct(raw()).price).toBe(49.95)
    expect(adaptProduct(raw({ price: null })).price).toBe(0)
  })

  it('lowercases category and catalogue', () => {
    const p = adaptProduct(raw())
    expect(p.category).toBe('clothing')
    expect(p.catalogue).toEqual(['streetwear', 'cultural'])
  })

  it('takes sku from the first variant', () => {
    expect(adaptProduct(raw()).sku).toBe('SKU-1')
  })

  it('handles missing variants and images without throwing', () => {
    const p = adaptProduct(raw({ variants: undefined, images: undefined }))
    expect(p.colours).toEqual([])
    expect(p.sizes).toEqual([])
    expect(p.images).toEqual([])
    expect(p.sku).toBe('')
  })
})
