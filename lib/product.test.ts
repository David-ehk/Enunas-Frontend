import { describe, it, expect } from 'vitest'
import { generateSlug } from './product'

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
