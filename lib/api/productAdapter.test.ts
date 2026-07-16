import { describe, it, expect } from 'vitest'
import { apiProductToCardShape } from './productAdapter'
import type { ApiProduct } from '@/types/api'

function product(overrides: Partial<ApiProduct> = {}): ApiProduct {
  return {
    id: '1',
    name: 'Waterfall',
    brandName: 'Test Brand',
    sku: 'X',
    slug: 'waterfall',
    price: 49.95,
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
