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

describe('sold-out product cards', () => {
  const stocked = (overrides: Partial<ApiProduct> = {}) =>
    product({
      colours: [
        { hex: '#000000', name: 'BLACK' },
        { hex: '#FFFFFF', name: 'WHITE' },
      ],
      imageObjects: [],
      variants: [
        { id: 1, sku: 'B-M', color: 'BLACK', colorId: 10, size: 'M', stockQuantity: 0 },
        { id: 2, sku: 'B-L', color: 'BLACK', colorId: 10, size: 'L', stockQuantity: 0 },
        { id: 3, sku: 'W-M', color: 'WHITE', colorId: 11, size: 'M', stockQuantity: 4 },
        { id: 4, sku: 'W-L', color: 'WHITE', colorId: 11, size: 'L', stockQuantity: 0 },
      ],
      ...overrides,
    })

  it('flags a product as sold out only when every variant has no stock', () => {
    const all0 = stocked({ variants: stocked().variants!.map(v => ({ ...v, stockQuantity: 0 })) })
    expect(apiProductToCardShape(all0).soldOut).toBe(true)
    expect(apiProductToCardShape(stocked()).soldOut).toBe(false)
  })

  it('never flags a product without variant data as sold out', () => {
    expect(apiProductToCardShape(product()).soldOut).toBe(false)
  })

  it('lists only sizes that are still in stock', () => {
    expect(apiProductToCardShape(stocked()).sizes).toEqual(['M'])
  })

  it('flags each colour card on its own', () => {
    const [black, white] = apiProductToColourwayCards(stocked())
    expect(black.soldOut).toBe(true)
    expect(black.sizes).toEqual([])
    expect(white.soldOut).toBe(false)
    expect(white.sizes).toEqual(['M'])
  })
})

describe('colour cards still show the other colours', () => {
  const p = () =>
    product({
      colours: [
        { hex: '#D8C8A8', name: 'BEIGE' },
        { hex: '#2E7D4F', name: 'GREEN' },
        { hex: '#0A0A0A', name: 'BLACK' },
      ],
      variants: [],
    })

  it("lists the card's own colour first, then the others in their original order", () => {
    const cards = apiProductToColourwayCards(p())
    expect(cards[1].allColours?.map(c => c.name)).toEqual(['GREEN', 'BEIGE', 'BLACK'])
    expect(cards[2].allColours?.map(c => c.name)).toEqual(['BLACK', 'BEIGE', 'GREEN'])
  })

  it('keeps `colours` to the own colour so the colour filter only matches that card', () => {
    const cards = apiProductToColourwayCards(p())
    expect(cards[1].colours.map(c => c.name)).toEqual(['GREEN'])
  })

  it('leaves allColours unset on an ordinary one-colour card', () => {
    expect(apiProductToCardShape(product()).allColours).toBeUndefined()
  })
})
