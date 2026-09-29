import { describe, it, expect } from 'vitest'
import { apiProductToCardShape, apiProductToColourwayCards } from './productAdapter'
import type { ApiProduct } from '@/types/api'

function product(overrides: Partial<ApiProduct> = {}): ApiProduct {
  return {
    id: '1',
    name: 'Waterfall',
    brandName: 'Test Brand',
    sku: 'X',
    slug: 'waterfall',
    price: 49.95,
    available: true,
    category: 'clothing',
    images: ['a.jpg', 'b.jpg'],
    colours: [{ hex: '#000000', name: 'Black' }],
    sizes: [' m ', 'l'],
    catalogue: [],
    status: 'APPROVED',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('apiProductToCardShape', () => {
  it('formats price in German locale with euro suffix', () => {
    expect(apiProductToCardShape(product()).price).toBe('49,95€')
  })

  it('builds the href from the brand slug and product slug', () => {
    expect(apiProductToCardShape(product()).href).toBe('/bekleidung/test-brand/waterfall')
  })

  it('uses the first image, falling back to empty string', () => {
    expect(apiProductToCardShape(product()).imgURL).toBe('a.jpg')
    expect(apiProductToCardShape(product({ images: [] })).imgURL).toBe('')
  })

  it('trims and uppercases sizes', () => {
    expect(apiProductToCardShape(product()).sizes).toEqual(['M', 'L'])
  })
})

describe('apiProductToColourwayCards', () => {
  const twoColours = () =>
    product({
      images: ['shared.jpg', 'black.jpg', 'white.jpg'],
      imageObjects: [
        { url: 'shared.jpg', productColorId: null, primary: false },
        { url: 'black-2.jpg', productColorId: 10, primary: false },
        { url: 'black.jpg', productColorId: 10, primary: true },
        { url: 'white.jpg', productColorId: 11, primary: false },
      ],
      colours: [
        { hex: '#000000', name: 'BLACK' },
        { hex: '#FFFFFF', name: 'WHITE' },
      ],
      variants: [
        { id: 1, sku: 'B-M', color: 'BLACK', colorId: 10, size: 'M', stockQuantity: 3 },
        { id: 2, sku: 'B-L', color: 'BLACK', colorId: 10, size: 'L', stockQuantity: 3 },
        { id: 3, sku: 'W-L', color: 'WHITE', colorId: 11, size: 'L', stockQuantity: 3 },
      ],
    })

  it('returns a single unchanged card for a one-colour product', () => {
    const cards = apiProductToColourwayCards(product())
    expect(cards).toEqual([apiProductToCardShape(product())])
  })

  it('returns one card per colour, each with only its own swatch', () => {
    const cards = apiProductToColourwayCards(twoColours())
    expect(cards).toHaveLength(2)
    expect(cards[0].colours).toEqual([{ hex: '#000000', name: 'BLACK', colorFamily: undefined }])
    expect(cards[1].colours).toEqual([{ hex: '#FFFFFF', name: 'WHITE', colorFamily: undefined }])
  })

  it("shows each colour's own primary image, not the product's first image", () => {
    const cards = apiProductToColourwayCards(twoColours())
    expect(cards[0].imgURL).toBe('black.jpg')
    expect(cards[1].imgURL).toBe('white.jpg')
  })

  it('gives every colour card a distinct id and a link that opens on that colour', () => {
    const cards = apiProductToColourwayCards(twoColours())
    expect(new Set(cards.map(c => c.id)).size).toBe(2)
    expect(cards[0].href).toBe('/bekleidung/test-brand/waterfall?color=BLACK')
    expect(cards[1].href).toBe('/bekleidung/test-brand/waterfall?color=WHITE')
  })

  it("lists only the sizes that colour comes in", () => {
    const cards = apiProductToColourwayCards(twoColours())
    expect(cards[0].sizes).toEqual(['M', 'L'])
    expect(cards[1].sizes).toEqual(['L'])
  })

  it("falls back to the product's first image when a colour has no image of its own", () => {
    const p = twoColours()
    p.imageObjects = [{ url: 'black.jpg', productColorId: 10, primary: true }]
    const cards = apiProductToColourwayCards(p)
    expect(cards[0].imgURL).toBe('black.jpg')
    expect(cards[1].imgURL).toBe('shared.jpg')
  })
})
