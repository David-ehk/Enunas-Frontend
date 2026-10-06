import { describe, it, expect } from 'vitest'
import { toggleLookSelection, isLookSelected } from './LookPicker'

// Production, 30 Sep 2026: saved look picks come back as string ids ("24"), but the candidate
// products from GET /products/my carry numeric ids (24). The picker showed saved picks as
// unselected, and clicking one added it again — the product saved [24, 8, 24].
describe('look selection with mixed id types', () => {
  it('recognises a saved string id for a numeric candidate id', () => {
    expect(isLookSelected(['24', '8'], 24)).toBe(true)
    expect(isLookSelected(['24', '8'], 9)).toBe(false)
  })

  it('removes a saved pick when its numeric candidate is clicked, instead of adding a duplicate', () => {
    expect(toggleLookSelection(['24', '8'], 24)).toEqual(['8'])
  })

  it('stores newly added ids as strings', () => {
    expect(toggleLookSelection(['8'], 24)).toEqual(['8', '24'])
  })
})
