import { describe, it, expect } from 'vitest'
import { apiProductToCardShape, apiProductToColourwayCards, apiProductToCoverCard } from './productAdapter'
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

// "E2E-0930 Fallback Tee" (product 31) on production, 30 Sep 2026: BLUE has its own photo, GREEN
// has none, plus one shared photo. The GREEN card showed the BLUE photo because it fell back to
// the product's first image. A colour without its own photo must show a shared one instead.
describe('apiProductToColourwayCards — colour without its own images', () => {
  const tee = (imageObjects: ApiProduct['imageObjects']) =>
    product({
      images: (imageObjects ?? []).map(i => i.url),
      imageObjects,
      colours: [
        { hex: '#1F3F8F', name: 'BLUE' },
        { hex: '#2E7D4F', name: 'GREEN' },
      ],
      variants: [
        { id: 1, sku: 'B-M', color: 'BLUE', colorId: 43, size: 'M', stockQuantity: 3 },
        { id: 2, sku: 'G-M', color: 'GREEN', colorId: 44, size: 'M', stockQuantity: 3 },
      ],
    })

  it("shows a shared image, never another colour's photo", () => {
    const [, green] = apiProductToColourwayCards(tee([
      { url: 'blue.jpg', productColorId: 43, primary: true },
      { url: 'shared.jpg', productColorId: null, primary: false },
    ]))
    expect(green.imgURL).toBe('shared.jpg')
  })

  it('prefers the primary shared image when there are several', () => {
    const [, green] = apiProductToColourwayCards(tee([
      { url: 'blue.jpg', productColorId: 43, primary: true },
      { url: 'shared-1.jpg', productColorId: null, primary: false },
      { url: 'shared-cover.jpg', productColorId: null, primary: true },
    ]))
    expect(green.imgURL).toBe('shared-cover.jpg')
  })

  it('still shows its own photo on the colour that has one', () => {
    const [blue] = apiProductToColourwayCards(tee([
      { url: 'shared.jpg', productColorId: null, primary: false },
      { url: 'blue.jpg', productColorId: 43, primary: true },
    ]))
    expect(blue.imgURL).toBe('blue.jpg')
  })
})

// Homepage cards show one card per product. On 30 Sep 2026 the P1 card showed the BLACK cover
// photo next to a RED swatch and opened the PDP on RED. Swatch and link must follow the colour
// the cover photo belongs to.
describe('apiProductToCoverCard', () => {
  const hoodie = (imageObjects: ApiProduct['imageObjects']) =>
    product({
      images: (imageObjects ?? []).map(i => i.url),
      imageObjects,
      colours: [
        { hex: '#B01E2A', name: 'RED' },
        { hex: '#FFFFFF', name: 'WHITE' },
        { hex: '#000000', name: 'BLACK' },
      ],
      variants: [
        { id: 1, sku: 'R-S', color: 'RED', colorId: 40, size: 'S', stockQuantity: 3 },
        { id: 2, sku: 'W-M', color: 'WHITE', colorId: 41, size: 'M', stockQuantity: 3 },
        { id: 3, sku: 'B-M', color: 'BLACK', colorId: 42, size: 'M', stockQuantity: 3 },
      ],
    })

  it("puts the cover photo's colour first and opens the PDP on it", () => {
    const card = apiProductToCoverCard(hoodie([
      { url: 'black-2.jpg', productColorId: 42, primary: true },
      { url: 'red-1.jpg', productColorId: 40, primary: true },
    ]))
    expect(card.imgURL).toBe('black-2.jpg')
    expect(card.colours.map(c => c.name)).toEqual(['BLACK', 'RED', 'WHITE'])
    expect(card.href).toBe('/bekleidung/test-brand/waterfall?color=BLACK')
  })

  it('leaves the card unchanged when the cover photo is a shared one', () => {
    const p = hoodie([
      { url: 'shared.jpg', productColorId: null, primary: true },
      { url: 'red-1.jpg', productColorId: 40, primary: true },
    ])
    expect(apiProductToCoverCard(p)).toEqual(apiProductToCardShape(p))
  })

  it('leaves the card unchanged when there is no per-image colour data', () => {
    const p = product()
    expect(apiProductToCoverCard(p)).toEqual(apiProductToCardShape(p))
  })
})
