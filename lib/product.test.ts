import { describe, it, expect } from 'vitest'
import { generateSlug, colourHref, withColourFirst } from './product'

describe('generateSlug', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(generateSlug('Nike Air Max')).toBe('nike-air-max')
  })

  it('transliterates German umlauts and ß', () => {
    expect(generateSlug('Größe Über')).toBe('groesse-ueber')
    expect(generateSlug('Weiß')).toBe('weiss')
    expect(generateSlug('Ärmel Öl')).toBe('aermel-oel')
  })

  it('strips non-word characters', () => {
    expect(generateSlug('Pull & Bear!')).toBe('pull-bear')
    expect(generateSlug('Nike® Shoes')).toBe('nike-shoes')
  })

  it('collapses repeated separators into a single hyphen', () => {
    expect(generateSlug('A   &   B')).toBe('a-b')
  })

  it('leaves a trailing hyphen when input ends in whitespace (trim does not strip dashes)', () => {
    // Documented edge: trim() removes whitespace, not the hyphen that whitespace became.
    expect(generateSlug('Trailing ')).toBe('trailing-')
  })

  it('handles empty string', () => {
    expect(generateSlug('')).toBe('')
  })
})

// One builder for "open the PDP on this colour" links (colourway cards, homepage cover cards,
// saved favourites) — the PDP reads it back via ?color=.
describe('colourHref', () => {
  it('appends the colour, URL-encoded', () => {
    expect(colourHref('/bekleidung/brand/hoodie', 'Weiß')).toBe('/bekleidung/brand/hoodie?color=Wei%C3%9F')
  })

  it('returns the plain link when there is no colour', () => {
    expect(colourHref('/bekleidung/brand/hoodie', null)).toBe('/bekleidung/brand/hoodie')
    expect(colourHref('/bekleidung/brand/hoodie', undefined)).toBe('/bekleidung/brand/hoodie')
  })
})

// A card or favourite for one colour leads with that colour's swatch (30 Sep 2026: a WHITE
// favourite on /saved-lists still showed RED first).
describe('withColourFirst', () => {
  const colours = [{ name: 'RED' }, { name: 'WHITE' }, { name: 'BLACK' }]

  it('moves the named colour to the front and keeps the rest in order', () => {
    expect(withColourFirst(colours, 'BLACK').map(c => c.name)).toEqual(['BLACK', 'RED', 'WHITE'])
  })

  it('returns the list unchanged for an unknown or missing colour', () => {
    expect(withColourFirst(colours, 'GREEN')).toEqual(colours)
    expect(withColourFirst(colours, null)).toEqual(colours)
  })
})
