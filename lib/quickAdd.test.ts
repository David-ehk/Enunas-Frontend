import { describe, it, expect, vi } from 'vitest'
import { variantColours, sizeChoices, buildCartLine, quickAdd, savedColour, pictureChoice } from './quickAdd'
import { FetchError } from './api/fetcher'
import type { ApiProduct, ApiListing } from '@/types/api'
import type { CartItem } from '@/app/context/CartContext'

const variant = (id: number, color: string, size: string, stockQuantity: number) =>
  ({ id, sku: String(id), color, colorFamily: 'BLACK', size, stockQuantity })

const product = {
  id: '7', name: 'Track Jacket', brandName: 'Müller Studio', slug: 'track-jacket', price: 89,
  currency: 'EUR', available: true, images: ['cover.jpg'],
  imageObjects: [{ url: 'white.jpg', productColorId: 52, primary: false }],
  colours: [{ id: '51', name: 'Black', hex: '#0A0A0A' }, { id: '52', name: 'White', hex: '#FFFFFF' }],
  variants: [
    variant(1, 'Black', 'S', 0), variant(2, 'Black', 'M', 2),
    { ...variant(3, 'White', 'M', 4), colorId: 52 }, variant(4, 'White', 'L', 1),
  ],
} as unknown as ApiProduct

const listings = [
  { id: '900', variantColor: 'Black', variantSize: 'M', price: 89 },
  { id: '901', variantColor: 'White', variantSize: 'M', price: 89 },
] as ApiListing[]

describe('variant choices', () => {
  it('lists distinct colours in first-seen order', () => {
    expect(variantColours(product)).toEqual(['Black', 'White'])
  })

  it('disables zero-stock and missing sizes', () => {
    expect(sizeChoices(product, 'Black')).toEqual([
      { size: 'S', unavailable: true },
      { size: 'M', unavailable: false },
      { size: 'L', unavailable: true },
    ])
  })
})

describe('pictureChoice', () => {
  // `product` has Black first; its only tagged photo is White's.
  const photos = { ...product, images: ['white.jpg'] } as ApiProduct

  it('takes the colour the first photo shows', () => {
    expect(pictureChoice(photos)).toEqual({ colour: 'White', image: 'white.jpg' })
  })

  it('moves to a colour with stock, and to its photo, when the pictured one is sold out', () => {
    const p = {
      ...product,
      images: ['white.jpg', 'black.jpg'],
      imageObjects: [
        { url: 'white.jpg', productColorId: 52, primary: true },
        { url: 'black.jpg', productColorId: 51, primary: true },
      ],
      variants: [
        { ...variant(2, 'Black', 'M', 2), colorId: 51 },
        { ...variant(3, 'White', 'M', 0), colorId: 52 },
      ],
    } as unknown as ApiProduct
    expect(pictureChoice(p)).toEqual({ colour: 'Black', image: 'black.jpg' })
  })

  it('takes the first colour with stock when photos have no colour', () => {
    const p = { ...product, images: ['cover.jpg'], imageObjects: [] } as unknown as ApiProduct
    expect(pictureChoice(p)).toEqual({ colour: 'Black', image: 'cover.jpg' })
  })
})

describe('buildCartLine', () => {
  it('builds the same line as the product page', () => {
    expect(buildCartLine(product, 'White', 'M', listings)).toEqual({
      productId: '7', name: 'Track Jacket', brand: 'Müller Studio', price: 89, currency: 'EUR', size: 'M',
      color: { id: '1', name: 'White', hex: '#FFFFFF' },
      image: 'white.jpg', defaultListingId: '901', stockQuantity: 4,
      productPath: '/bekleidung/mueller-studio/track-jacket',
    })
  })

  it('returns null without a matching listing', () => {
    expect(buildCartLine(product, 'White', 'L', listings)).toBeNull()
  })
})

describe('quickAdd', () => {
  function run(over: Partial<Parameters<typeof quickAdd>[0]> = {}) {
    const addToCart = vi.fn()
    const result = quickAdd({
      product, colour: 'Black', size: 'M', cartItems: [],
      getListings: async () => listings, addToCart, ...over,
    })
    return { result, addToCart }
  }

  it('adds the built line', async () => {
    const { result, addToCart } = run()
    await expect(result).resolves.toEqual({ status: 'added' })
    expect(addToCart).toHaveBeenCalledWith(buildCartLine(product, 'Black', 'M', listings))
  })

  it('fails without a matching listing and adds nothing', async () => {
    const { result, addToCart } = run({ colour: 'White', size: 'L' })
    await expect(result).resolves.toEqual({ status: 'failed' })
    expect(addToCart).not.toHaveBeenCalled()
  })

  it('asks for login on 401', async () => {
    const { result, addToCart } = run({ getListings: async () => { throw new FetchError(401, 'x') } })
    await expect(result).resolves.toEqual({ status: 'login' })
    expect(addToCart).not.toHaveBeenCalled()
  })

  it('fails on any other error', async () => {
    const { result, addToCart } = run({ getListings: async () => { throw new FetchError(500, 'x') } })
    await expect(result).resolves.toEqual({ status: 'failed' })
    expect(addToCart).not.toHaveBeenCalled()
  })

  it('reports the stock limit when the cart already holds all of it', async () => {
    const held = { id: 'a', productId: '7', size: 'M', color: { id: '0', name: 'Black', hex: '#0A0A0A' }, quantity: 2 } as CartItem
    const { result, addToCart } = run({ cartItems: [held] })
    await expect(result).resolves.toEqual({ status: 'atLimit' })
    expect(addToCart).not.toHaveBeenCalled()
  })
})

describe('savedColour', () => {
  it('takes the colour the favourite was saved in, ignoring case', () => {
    expect(savedColour(product, '/bekleidung/x/track-jacket?color=white')).toBe('White')
  })

  it('falls back to the first colour with stock', () => {
    const blackGone = { ...product, variants: [variant(1, 'Black', 'M', 0), variant(3, 'White', 'M', 4)] } as ApiProduct
    expect(savedColour(blackGone, '/bekleidung/x/track-jacket')).toBe('White')
    expect(savedColour(product, '/bekleidung/x/track-jacket?color=Green')).toBe('Black')
  })
})
