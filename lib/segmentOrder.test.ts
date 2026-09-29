import { describe, it, expect } from 'vitest'
import { sortSegments } from './segmentOrder'

describe('sortSegments', () => {
  it('reorders to the canonical Streetwear → Experimental → Athleisure → Cultural → Star order', () => {
    expect(sortSegments(['cultural', 'star', 'streetwear'])).toEqual(['streetwear', 'cultural', 'star'])
  })

  it('keeps the canonical order when Streetwear is missing', () => {
    expect(sortSegments(['star', 'athleisure', 'experimental'])).toEqual(['experimental', 'athleisure', 'star'])
  })

  it('folds the "culture" alias to the same rank as "cultural"', () => {
    expect(sortSegments(['star', 'culture', 'streetwear'])).toEqual(['streetwear', 'culture', 'star'])
  })

  it('is case-insensitive', () => {
    expect(sortSegments(['Star', 'STREETWEAR', 'Cultural'])).toEqual(['STREETWEAR', 'Cultural', 'Star'])
  })

  it('places unknown segments after every known one, keeping their relative order', () => {
    expect(sortSegments(['star', 'mystery', 'streetwear', 'other'])).toEqual(['streetwear', 'star', 'mystery', 'other'])
  })

  it('returns a new array and leaves the input untouched', () => {
    const input = ['star', 'streetwear']
    const result = sortSegments(input)
    expect(result).not.toBe(input)
    expect(input).toEqual(['star', 'streetwear'])
  })
})
