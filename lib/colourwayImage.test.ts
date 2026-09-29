import { describe, it, expect } from 'vitest'
import { colourwayCoverImage } from './colourwayImage'

// Enunas Cargo Pant (product 8) as its PDP adapter saw it on 14 Sep 2026: one shared image,
// then one image per colourway (BLACK = colour 9, BEIGE = 33, GREEN = 34).
const cargoPant = [
  { url: 'shared.jpg', productColorId: null, primary: false },
  { url: 'black.jpg',  productColorId: 9,    primary: false },
  { url: 'beige.jpg',  productColorId: 33,   primary: false },
  { url: 'green.jpg',  productColorId: 34,   primary: false },
]

describe('colourwayCoverImage', () => {
  it("uses the selected colourway's own image, not the shared one listed first", () => {
    expect(colourwayCoverImage(cargoPant, 33, 'fallback.jpg')).toBe('beige.jpg')
  })

  it("prefers the colourway's primary image when it has several", () => {
    const images = [
      ...cargoPant,
      { url: 'beige-cover.jpg', productColorId: 33, primary: true },
    ]
    expect(colourwayCoverImage(images, 33, 'fallback.jpg')).toBe('beige-cover.jpg')
  })

  it('falls back when the colourway has no images of its own', () => {
    expect(colourwayCoverImage(cargoPant, 99, 'fallback.jpg')).toBe('fallback.jpg')
  })

  it('falls back when no colour is selected or the product has no colour metadata', () => {
    expect(colourwayCoverImage(cargoPant, null, 'fallback.jpg')).toBe('fallback.jpg')
    expect(colourwayCoverImage(undefined, 33, 'fallback.jpg')).toBe('fallback.jpg')
  })
})
