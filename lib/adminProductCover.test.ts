import { describe, it, expect } from 'vitest'
import { adminProductCover } from './adminProductCover'

// GET /admin/products sends image objects, not URL strings (seen live in the Schaufenster picker).
const image = (imageUrl: string, displayOrder: number, primary = false) => ({ imageUrl, displayOrder, primary })

describe('adminProductCover', () => {
  it('returns the URL of the primary image', () => {
    expect(adminProductCover([image('a.jpg', 0), image('b.jpg', 1, true)])).toBe('b.jpg')
  })

  it('without a primary image, takes the first in display order', () => {
    expect(adminProductCover([image('late.jpg', 2), image('first.jpg', 0)])).toBe('first.jpg')
  })

  it('also accepts plain URL strings', () => {
    expect(adminProductCover(['a.jpg', 'b.jpg'])).toBe('a.jpg')
  })

  it('has no cover when there are no images', () => {
    expect(adminProductCover([])).toBeUndefined()
    expect(adminProductCover(undefined)).toBeUndefined()
  })
})
