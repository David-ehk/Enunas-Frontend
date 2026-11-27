import { describe, it, expect } from 'vitest'
import { hasMoreBelow } from './scrollHint'

const box = (scrollTop: number, clientHeight = 400, scrollHeight = 1000) => ({ scrollTop, clientHeight, scrollHeight })

describe('hasMoreBelow', () => {
  it('is true at the top and part way down a list that overflows', () => {
    expect(hasMoreBelow(box(0))).toBe(true)
    expect(hasMoreBelow(box(300))).toBe(true)
  })

  it('is false at the bottom, also when zoom leaves a fraction of a pixel', () => {
    expect(hasMoreBelow(box(600))).toBe(false)
    expect(hasMoreBelow(box(599.4))).toBe(false)
  })

  it('is false when everything fits', () => {
    expect(hasMoreBelow(box(0, 400, 400))).toBe(false)
  })
})
