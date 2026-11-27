import { describe, it, expect } from 'vitest'
import { startIndex, centredIndex } from './sizeWheel'

const sizes = (...unavailable: boolean[]) => unavailable.map(u => ({ unavailable: u }))

describe('startIndex', () => {
  it('opens on the middle size', () => {
    expect(startIndex(sizes(false, false, false, false, false))).toBe(2)
  })

  it('opens on the buyable size nearest the middle when the middle is sold out', () => {
    expect(startIndex(sizes(false, false, true, true, false))).toBe(1)
  })

  it('stays on the middle when nothing can be bought', () => {
    expect(startIndex(sizes(true, true, true))).toBe(1)
  })
})

describe('centredIndex', () => {
  it('is the row nearest the middle of the wheel, kept inside the list', () => {
    expect(centredIndex(0, 48, 4)).toBe(0)
    expect(centredIndex(70, 48, 4)).toBe(1)
    expect(centredIndex(75, 48, 4)).toBe(2)
    expect(centredIndex(-30, 48, 4)).toBe(0)
    expect(centredIndex(900, 48, 4)).toBe(3)
  })
})
