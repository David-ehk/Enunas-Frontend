import { describe, it, expect } from 'vitest'
import { catMatchesProduct } from '@/app/(root)/bekleidung/components/FilterSidebar'
import { apiProductToCardShape, apiProductToColourwayCards } from './api/productAdapter'
import { adaptProduct, type RawProductResponse } from './api/productResponseAdapter'

// As GET /products sends it: category is only CLOTHING; slot and type say what it is.
const live = (outfitSlot: string, productType: string) =>
  adaptProduct({
    id: 1, name: 'Piece', slug: 'piece', price: 10, brandName: 'Brand', status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z', category: 'CLOTHING', outfitSlot, productType,
    variants: [
      { id: 1, sku: 'a', color: 'Black', colorFamily: 'BLACK', size: 'M', stockQuantity: 1 },
      { id: 2, sku: 'b', color: 'White', colorFamily: 'WHITE', size: 'M', stockQuantity: 1 },
    ],
  } as RawProductResponse)

const CATEGORIES = ['oberteile', 'hoodies', 'tshirts', 'jacken', 'hosen', 'jeans']
const matches = (outfitSlot: string, productType: string) => {
  const card = apiProductToCardShape(live(outfitSlot, productType))
  return CATEGORIES.filter(c => catMatchesProduct(c, card))
}

describe('shop category filters with live-shaped products', () => {
  it.each([
    ['TOP', 'T_SHIRT', ['oberteile', 'tshirts']],
    ['TOP', 'HOODIE', ['oberteile', 'hoodies']],
    ['BOTTOM', 'PANTS', ['hosen']],
    ['BOTTOM', 'JEANS', ['hosen', 'jeans']],
    ['OUTERWEAR', 'JACKET', ['jacken']],
  ])('%s / %s appears under %j', (slot, type, expected) => {
    expect(matches(slot, type)).toEqual(expected)
  })

  it('keeps working on the per-colour cards', () => {
    const cards = apiProductToColourwayCards(live('BOTTOM', 'PANTS'))
    expect(cards).toHaveLength(2)
    expect(cards.every(c => catMatchesProduct('hosen', c))).toBe(true)
  })
})
