import { describe, it, expect } from 'vitest'
import { collectionAbovePrice } from './collectionLine'

// A product may have both. With an inspiration story, the collection is listed only under
// Produktdetails; without one, it also appears above the price.
describe('collectionAbovePrice', () => {
  it('shows the collection above the price when there is no inspiration story', () => {
    expect(collectionAbovePrice('Herbst 2026', null)).toBe('Herbst 2026')
    expect(collectionAbovePrice('Herbst 2026', '')).toBe('Herbst 2026')
  })

  it('leaves the collection out above the price when there is an inspiration story', () => {
    expect(collectionAbovePrice('Herbst 2026', 'Eine Nacht in Lagos')).toBeNull()
  })

  it('does not count a blank story as a story', () => {
    expect(collectionAbovePrice('Herbst 2026', '  \n')).toBe('Herbst 2026')
  })

  it('shows nothing without a collection', () => {
    expect(collectionAbovePrice(null, null)).toBeNull()
    expect(collectionAbovePrice('', 'Eine Nacht in Lagos')).toBeNull()
  })
})
