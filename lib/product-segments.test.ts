import { describe, it, expect } from 'vitest'
import { productSegments, segmentBreakdown } from './product'

describe('productSegments', () => {
  it('reads the adapter field (already lowercased)', () => {
    expect(productSegments({ catalogue: ['streetwear', 'star'] })).toEqual(['streetwear', 'star'])
  })

  it('reads the raw backend field, as /wardrobe returns it', () => {
    expect(productSegments({ catalogueCategory: ['STREETWEAR', 'CULTURAL'] })).toEqual(['streetwear', 'cultural'])
  })

  it('accepts a bare string as well as an array', () => {
    expect(productSegments({ catalogueCategory: 'STAR' })).toEqual(['star'])
  })

  it('folds the culture/cultural alias so they never double-count', () => {
    expect(productSegments({ catalogueCategory: ['CULTURE'] })).toEqual(['cultural'])
    expect(productSegments({ catalogueCategory: ['CULTURE', 'Cultural'] })).toEqual(['cultural'])
  })

  it('is safe on missing or empty products', () => {
    expect(productSegments(null)).toEqual([])
    expect(productSegments(undefined)).toEqual([])
    expect(productSegments({})).toEqual([])
    expect(productSegments({ catalogue: [] })).toEqual([])
  })
})

describe('segmentBreakdown', () => {
  const list = [
    { catalogueCategory: ['STREETWEAR'] },
    { catalogueCategory: ['STREETWEAR', 'CULTURAL'] },
    { catalogueCategory: ['STAR'] },
    { catalogueCategory: ['STREETWEAR'] },
    { catalogueCategory: ['STAR'] },
  ]

  it('ranks segments by how often they appear', () => {
    expect(segmentBreakdown(list).map(s => [s.label, s.count])).toEqual([
      ['Streetwear', 3],
      ['Star', 2],
      ['Cultural', 1],
    ])
  })

  it('answers "more streetwear or star?" by ordering', () => {
    const [top] = segmentBreakdown(list)
    expect(top.segment).toBe('streetwear')
    expect(top.count).toBeGreaterThan(segmentBreakdown(list).find(s => s.segment === 'star')!.count)
  })

  it('counts a product once per segment, so totals may exceed the item count', () => {
    const total = segmentBreakdown(list).reduce((s, x) => s + x.count, 0)
    expect(total).toBe(6)      // 5 products, one sits in two catalogues
  })

  it('breaks count ties alphabetically for a stable order', () => {
    const tied = segmentBreakdown([{ catalogueCategory: ['STAR'] }, { catalogueCategory: ['ATHLEISURE'] }])
    expect(tied.map(s => s.label)).toEqual(['Athleisure', 'Star'])
  })

  it('returns nothing for an empty list', () => {
    expect(segmentBreakdown([])).toEqual([])
  })

  it('keeps unknown catalogue values rather than dropping them', () => {
    const out = segmentBreakdown([{ catalogueCategory: ['SOMETHING_NEW'] }])
    expect(out).toEqual([{ segment: 'something_new', label: 'Something_new', count: 1 }])
  })
})
