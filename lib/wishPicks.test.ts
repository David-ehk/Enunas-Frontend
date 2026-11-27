import { describe, it, expect } from 'vitest'
import { garmentGroup, pickFavourites } from './wishPicks'
import type { ApiProduct } from '@/types/api'

// The slot the backend sends for each kind of piece used below. A bag is neither top nor bottom.
const SLOTS: Record<string, string> = { t_shirt: 'TOP', hoodie: 'TOP', pants: 'BOTTOM', jeans: 'BOTTOM' }

function product(id: string, kind: string, catalogue: string[], over: Partial<ApiProduct> = {}): ApiProduct {
  return {
    id, category: 'clothing', outfitSlot: SLOTS[kind], catalogue, available: true,
    variants: [{ id: 1, sku: id, color: 'Black', colorFamily: 'BLACK', size: 'M', stockQuantity: 3 }],
    ...over,
  } as ApiProduct
}
const fav = (id: string) => ({ id })
const line = (productId: string, quantity = 1) => ({ productId, quantity })
const ids = (list: { id: string }[]) => list.map(f => f.id)

describe('garmentGroup', () => {
  const slot = (outfitSlot?: string) => garmentGroup({ category: 'clothing', outfitSlot } as ApiProduct)

  it("reads tops and bottoms from the backend's outfit slot", () => {
    expect(slot('TOP')).toBe('top')
    expect(slot('BOTTOM')).toBe('bottom')
    expect(slot('OUTERWEAR')).toBeNull()
    expect(slot()).toBeNull()
  })
})

describe('pickFavourites', () => {
  const pants = product('c', 'pants', ['athleisure'])

  it('shows at most 3', () => {
    const products = [pants, ...['1', '2', '3', '4'].map(id => product(id, 'bag', []))]
    expect(pickFavourites(['1', '2', '3', '4'].map(fav), [line('c')], products)).toHaveLength(3)
  })

  it('ranks the catalogue style above the matching garment', () => {
    const products = [pants, product('top', 't_shirt', ['streetwear']), product('sameStyle', 'pants', ['athleisure'])]
    expect(ids(pickFavourites([fav('top'), fav('sameStyle')], [line('c')], products))).toEqual(['sameStyle', 'top'])
  })

  it('within a style prefers tops for pants in the cart', () => {
    const products = [pants, product('trousers', 'jeans', ['athleisure']), product('hoodie', 'hoodie', ['athleisure'])]
    expect(ids(pickFavourites([fav('hoodie'), fav('trousers')], [line('c')], products))).toEqual(['hoodie', 'trousers'])
  })

  it('prefers bottoms for a top in the cart', () => {
    const products = [product('c', 'hoodie', []), product('tee', 't_shirt', []), product('jeans', 'jeans', [])]
    expect(ids(pickFavourites([fav('jeans'), fav('tee')], [line('c')], products))).toEqual(['jeans', 'tee'])
  })

  it("follows the cart's most important style first", () => {
    const products = [pants, product('s', 'bag', ['streetwear']), product('x', 'bag', ['streetwear']), product('a', 'bag', ['athleisure'])]
    const cart = [line('x', 1), line('c', 2)]
    expect(ids(pickFavourites([fav('a'), fav('s')], cart, products))).toEqual(['a', 's'])
  })

  it('puts sold-out, preview and unlisted favourites behind buyable ones', () => {
    const soldOut = product('out', 't_shirt', ['athleisure'], { variants: [{ id: 2, sku: 'o', color: 'Black', colorFamily: 'BLACK', size: 'M', stockQuantity: 0 }] })
    const preview = product('soon', 't_shirt', ['athleisure'], { preview: true })
    const products = [pants, soldOut, preview, product('ok', 'bag', [])]
    expect(ids(pickFavourites([fav('ok'), fav('out'), fav('soon'), fav('gone')], [line('c')], products))[0]).toBe('ok')
  })

  it('leaves out pieces already in the cart while others can fill the 3 places', () => {
    const products = [pants, ...['1', '2', '3'].map(id => product(id, 'bag', []))]
    expect(ids(pickFavourites(['c', '1', '2', '3'].map(fav), [line('c')], products))).not.toContain('c')
    expect(ids(pickFavourites(['c', '1'].map(fav), [line('c')], products))).toEqual(['1', 'c'])
  })

  it('shows the most recently saved first for an empty cart', () => {
    const products = ['1', '2', '3', '4'].map(id => product(id, 'bag', []))
    expect(ids(pickFavourites(['1', '2', '3', '4'].map(fav), [], products))).toEqual(['4', '3', '2'])
  })
})

describe('pickFavourites with equally important styles', () => {
  it('treats both styles of one cart piece alike, so the matching garment decides', () => {
    const products = [
      product('c', 'pants', ['streetwear', 'athleisure']),
      product('hoodie', 'hoodie', ['athleisure']),
      product('trousers', 'pants', ['streetwear']),
    ]
    expect(ids(pickFavourites([fav('hoodie'), fav('trousers')], [line('c')], products))).toEqual(['hoodie', 'trousers'])
  })
})
