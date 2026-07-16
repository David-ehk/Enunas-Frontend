import { describe, it, expect, beforeEach } from 'vitest'
import { getCuration } from './curation'

const STORAGE_KEY = 'enunas_curation_v1'

beforeEach(() => {
  localStorage.clear()
})

describe('getCuration', () => {
  it('returns empty defaults when nothing is stored', () => {
    expect(getCuration()).toEqual({
      trendy: [],
      drops: [],
      recommendations: { streetwear: [], cultural: [], athleisure: [], experimental: [], star: [] },
    })
  })

  it('merges a partial stored object with defaults', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      trendy: ['1', '2'],
      recommendations: { streetwear: ['9'] },
    }))
    const c = getCuration()
    expect(c.trendy).toEqual(['1', '2'])
    expect(c.drops).toEqual([])
    expect(c.recommendations.streetwear).toEqual(['9'])
    expect(c.recommendations.cultural).toEqual([])
    expect(c.recommendations.star).toEqual([])
  })

  it('falls back to empty defaults on malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{')
    expect(getCuration().trendy).toEqual([])
  })
})
