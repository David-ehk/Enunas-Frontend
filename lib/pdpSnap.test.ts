import { describe, it, expect } from 'vitest'
import { snapTarget } from './pdpSnap'

// 0 = full photo, `lock` = the stop at "Produktdetails".
const lock = 600

describe('snapTarget', () => {
  it('carries even a short swipe down on to the lock', () => {
    expect(snapTarget({ from: 0, to: 40, lock })).toBe(600)
    expect(snapTarget({ from: 0, to: 450, lock })).toBe(600)
  })

  it('carries a swipe back up on to the full photo', () => {
    expect(snapTarget({ from: 600, to: 560, lock })).toBe(0)
    expect(snapTarget({ from: 900, to: 300, lock })).toBe(0)
  })

  it('settles a barely moved finger on the nearer end', () => {
    expect(snapTarget({ from: 0, to: 4, lock })).toBe(0)
    expect(snapTarget({ from: 600, to: 596, lock })).toBe(600)
  })

  it('stops a hard flick from above at the lock', () => {
    expect(snapTarget({ from: 0, to: 900, lock })).toBe(600)
    expect(snapTarget({ from: 300, to: 1500, lock })).toBe(600)
  })

  it('leaves scrolling free at the ends and from the lock downwards', () => {
    expect(snapTarget({ from: 40, to: 0, lock })).toBeNull()
    expect(snapTarget({ from: 0, to: 600, lock })).toBeNull()
    expect(snapTarget({ from: 600, to: 900, lock })).toBeNull()
    expect(snapTarget({ from: 1200, to: 800, lock })).toBeNull()
  })

  it('does nothing when the buy button already fits on the first screen', () => {
    expect(snapTarget({ from: 0, to: 40, lock: 0 })).toBeNull()
  })
})
