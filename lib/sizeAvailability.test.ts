import { describe, it, expect } from 'vitest'
import { isSizeUnavailable } from './sizeAvailability'

describe('isSizeUnavailable', () => {
  it('crosses out every size of a coming-soon product, even with stock', () => {
    expect(isSizeUnavailable({ stockQuantity: 5 }, true)).toBe(true)
    expect(isSizeUnavailable({ stockQuantity: 0 }, true)).toBe(true)
    expect(isSizeUnavailable(undefined, true)).toBe(true)
  })

  it('crosses out a released size only when it is sold out or missing for the colour', () => {
    expect(isSizeUnavailable({ stockQuantity: 5 }, false)).toBe(false)
    expect(isSizeUnavailable({ stockQuantity: 0 }, false)).toBe(true)
    expect(isSizeUnavailable(undefined, false)).toBe(true)
  })
})
