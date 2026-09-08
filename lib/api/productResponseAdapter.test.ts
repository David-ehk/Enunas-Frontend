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
  it('carries collectionName through and treats the empty string as unset', () => {
    expect(adaptProduct(raw({ collectionName: 'Herbst 2026' })).collectionName).toBe('Herbst 2026')
    expect(adaptProduct(raw({ collectionName: '' })).collectionName).toBeNull()
    expect(adaptProduct(raw()).collectionName).toBeNull()
  })

  it('treats a non-null originalPrice as the sale signal without comparing it to price', () => {
    expect(adaptProduct(raw({ price: 119.95, originalPrice: 149.95 })).originalPrice).toBe(149.95)
    expect(adaptProduct(raw({ price: 89.95, originalPrice: null })).originalPrice).toBeNull()
    expect(adaptProduct(raw({ price: 89.95 })).originalPrice).toBeNull()
  })

  it('keeps an originalPrice the backend reports at or below price', () => {
    // The pair always comes from one listing, so the backend is the authority on what counts as
    // a markdown. Second-guessing it here would silently drop a legitimate sale.
    expect(adaptProduct(raw({ price: 50, originalPrice: 50 })).originalPrice).toBe(50)
    expect(adaptProduct(raw({ price: 50, originalPrice: 40 })).originalPrice).toBe(40)
  })

  it('carries the sale pair onto complete-the-look items', () => {
    const out = adaptProduct(raw({
      completeTheLookProducts: [
        { id: 8, name: 'Cargo Pant', price: 99.95, originalPrice: 129.95, image: 'p.jpg' },
        { id: 9, name: 'Tee', price: 29.95, image: 't.jpg' },
        { id: 10, name: 'Unsellable', price: null, image: 'u.jpg' },
      ],
    }))
    expect(out.completeTheLookProducts?.[0].originalPrice).toBe(129.95)
    expect(out.completeTheLookProducts?.[1].originalPrice).toBeNull()
    expect(out.completeTheLookProducts?.[2].price).toBeNull()
  })

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

  it('flags a null price as unavailable so it is never shown as 0,00 €', () => {
    expect(adaptProduct(raw()).available).toBe(true)
    expect(adaptProduct(raw({ price: null })).available).toBe(false)
  })

  it('carries real variants through so the PDP can gate sold-out sizes', () => {
    const p = adaptProduct(raw())
    expect(p.variants).toHaveLength(3)
    expect(p.variants?.map(v => v.stockQuantity)).toEqual([5, 3, 2])
    expect(p.variants?.map(v => v.sku)).toEqual(['SKU-1', 'SKU-2', 'SKU-3'])
  })

  it('carries the return period through and defaults to 14, never 30', () => {
    expect(adaptProduct(raw({ returnPeriodDays: 14 })).returnPeriodDays).toBe(14)
    expect(adaptProduct(raw({ returnPeriodDays: 30 })).returnPeriodDays).toBe(30)
    // Omitted by the response → backend's own default, not the PDP's old hardcoded 30.
    expect(adaptProduct(raw()).returnPeriodDays).toBe(14)
  })

  it('keeps colours[].name and variants[].color on the same join key', () => {
    // The PDP resolves a chip via findVariant(variants, selectedColor, size), where selectedColor
    // comes from colours[].name. If these two ever diverge, NO variant resolves and every size
    // renders disabled — indistinguishable from genuinely sold out.
    const p = adaptProduct(raw())
    const variantColors = new Set(p.variants?.map(v => v.color))
    for (const c of p.colours) expect(variantColors.has(c.name)).toBe(true)
    // And the pairing actually resolves to the right stock.
    const found = p.variants?.find(v => v.color === 'Blue' && v.size === 'L')
    expect(found?.stockQuantity).toBe(3)
  })

  it('preserves a zero stockQuantity rather than defaulting it', () => {
    // The PDP previously synthesised every variant with stockQuantity: 10, which is why a
    // sold-out size stayed selectable and addable to the basket.
    const p = adaptProduct(raw({
      variants: [{ id: 1, sku: 'SKU-1', color: 'Black', colorFamily: 'BLACK', size: 'M', stockQuantity: 0 }],
    }))
    expect(p.variants?.[0].stockQuantity).toBe(0)
  })

  it('lowercases category and catalogue', () => {
    const p = adaptProduct(raw())
    expect(p.category).toBe('clothing')
    expect(p.catalogue).toEqual(['streetwear', 'cultural'])
  })

  it('takes sku from the first variant', () => {
    expect(adaptProduct(raw()).sku).toBe('SKU-1')
  })

  it('carries the preview flag through, defaulting to false', () => {
    expect(adaptProduct(raw({ preview: true })).preview).toBe(true)
    expect(adaptProduct(raw({ preview: false })).preview).toBe(false)
    expect(adaptProduct(raw()).preview).toBe(false)
  })

  it('a preview product is unavailable with a null price coalesced to 0', () => {
    const p = adaptProduct(raw({ preview: true, price: null, originalPrice: null }))
    expect(p.preview).toBe(true)
    expect(p.available).toBe(false)
    expect(p.price).toBe(0)
    expect(p.originalPrice).toBeNull()
  })

  it('handles missing variants and images without throwing', () => {
    const p = adaptProduct(raw({ variants: undefined, images: undefined }))
    expect(p.colours).toEqual([])
    expect(p.sizes).toEqual([])
    expect(p.images).toEqual([])
    expect(p.sku).toBe('')
  })
})

describe('completeTheLookProducts', () => {
  const base = {
    id: 41, name: 'Jacket', slug: 'jacket', price: 200, brandName: 'Alpha',
    status: 'ACTIVE', createdAt: '2026-01-01T00:00:00',
  }

  it('carries a null price through instead of coercing it to 0', () => {
    const p = adaptProduct({
      ...base,
      completeTheLookProducts: [
        { id: 88, name: 'Cargo Pant', price: 129 },
        { id: 92, name: 'Wool Beanie', price: null },
      ],
    } as never)
    expect(p.completeTheLookProducts?.map(i => i.price)).toEqual([129, null])
  })

  it('is undefined when the backend omits the field', () => {
    expect(adaptProduct(base as never).completeTheLookProducts).toBeUndefined()
  })
})
