import { describe, it, expect } from 'vitest'
import { rankCartStyles, pickSuggestions } from './cartSuggestions'
import type { ApiProduct, CurationData } from '@/types/api'

function product(id: string, catalogue: string[], over: Partial<ApiProduct> = {}): ApiProduct {
  return {
    id, name: `P${id}`, brandName: 'Brand', sku: id, slug: `p-${id}`, price: 10, available: true,
    category: 'tops', images: [], colours: [], sizes: ['M'], catalogue, status: 'ACTIVE',
    createdAt: '2026-01-01', variants: [{ id: 1, sku: id, color: 'Black', colorFamily: 'BLACK', size: 'M', stockQuantity: 3 }],
    ...over,
  } as ApiProduct
}

const line = (productId: string, quantity = 1) => ({ productId, quantity })

function curation(rec: Partial<CurationData['recommendations']>): CurationData {
  return {
    trendy: [], drops: [],
    recommendations: { streetwear: [], cultural: [], athleisure: [], experimental: [], star: [], ...rec },
  }
}

const ids = (list: ApiProduct[]) => list.map(p => String(p.id))

describe('rankCartStyles', () => {
  it('weights by quantity', () => {
    const products = [product('1', ['cultural']), product('2', ['athleisure'])]
    expect(rankCartStyles([line('1', 1), line('2', 2)], products)).toEqual(['athleisure', 'cultural'])
  })

  it('counts both styles of a two-style product, folding culture into cultural', () => {
    const products = [product('1', ['culture', 'athleisure']), product('2', ['cultural'])]
    expect(rankCartStyles([line('2'), line('1')], products)).toEqual(['cultural', 'athleisure'])
  })

  it('breaks a tie by the last cart line', () => {
    const products = [product('1', ['streetwear']), product('2', ['athleisure'])]
    expect(rankCartStyles([line('1'), line('2')], products)).toEqual(['athleisure', 'streetwear'])
  })

  it('ignores cart products not in the list and unknown styles', () => {
    expect(rankCartStyles([line('9'), line('1')], [product('1', ['gorpcore'])])).toEqual([])
  })
})

describe('pickSuggestions', () => {
  const cartPiece = product('1', ['athleisure'])
  const pool = ['11', '12', '13', '14', '15'].map(id => product(id, ['athleisure']))

  it('returns at most 3 in Schaufenster order', () => {
    const out = pickSuggestions([line('1')], [cartPiece, ...pool], curation({ athleisure: ['15', '12', '14', '11', '13'] }))
    expect(ids(out)).toEqual(['15', '12', '14'])
  })

  it('skips in-cart, sold-out, unavailable, preview and unlisted picks', () => {
    const soldOut = product('2', [], { variants: [{ id: 2, sku: '2', color: 'Black', colorFamily: 'BLACK', size: 'M', stockQuantity: 0 }] })
    const unavailable = product('3', [], { available: false })
    const preview = product('4', [], { preview: true })
    const good = product('5', [])
    const out = pickSuggestions([line('1')], [cartPiece, soldOut, unavailable, preview, good],
      curation({ athleisure: ['1', '2', '3', '4', '99', '5'] }))
    expect(ids(out)).toEqual(['5'])
  })

  it('falls back to the next style without mixing', () => {
    const second = product('2', ['streetwear'])
    const out = pickSuggestions([line('1', 2), line('2', 1)], [cartPiece, second, ...pool],
      curation({ athleisure: ['99'], streetwear: ['11', '12'] }))
    expect(ids(out)).toEqual(['11', '12'])
    const top = pickSuggestions([line('1', 2), line('2', 1)], [cartPiece, second, ...pool],
      curation({ athleisure: ['13'], streetwear: ['11', '12'] }))
    expect(ids(top)).toEqual(['13'])
  })

  it('returns [] for empty cart, null curation, or nothing eligible', () => {
    const full = curation({ athleisure: ['11'] })
    expect(pickSuggestions([], [cartPiece, ...pool], full)).toEqual([])
    expect(pickSuggestions([line('1')], [cartPiece, ...pool], null)).toEqual([])
    expect(pickSuggestions([line('1')], [cartPiece, ...pool], curation({}))).toEqual([])
  })
})
