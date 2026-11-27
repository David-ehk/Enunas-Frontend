import { describe, it, expect } from 'vitest'
import { cardQuickAdd } from './cardQuickAdd'
import type { ApiProduct } from '@/types/api'

const variant = (color: string, size: string, stockQuantity: number) =>
  ({ color, size, stockQuantity })

const product = (over: Record<string, unknown> = {}) => ({
  id: '7', name: 'Track Jacket', available: true, preview: false,
  variants: [variant('Black', 'S', 0), variant('Black', 'M', 0), variant('White', 'M', 4), variant('White', 'S', 0)],
  ...over,
}) as unknown as ApiProduct

// A card's "+" offers the sizes of the first colour that has stock. No stock to buy, no "+".
describe('cardQuickAdd', () => {
  it('offers the sizes of the first colour with stock, sold-out sizes marked', () => {
    expect(cardQuickAdd(product())).toEqual({
      colour: 'White',
      sizes: [{ size: 'S', unavailable: true }, { size: 'M', unavailable: false }],
      manyColours: true,
    })
  })

  it('offers nothing for a coming-soon product', () => {
    expect(cardQuickAdd(product({ preview: true }))).toBeNull()
  })

  it('offers nothing for a product without an active listing', () => {
    expect(cardQuickAdd(product({ available: false }))).toBeNull()
  })

  it('offers nothing when every size is sold out', () => {
    expect(cardQuickAdd(product({ variants: [variant('Black', 'M', 0)] }))).toBeNull()
  })

  it('offers nothing without variants', () => {
    expect(cardQuickAdd(product({ variants: [] }))).toBeNull()
  })
})
