import { describe, it, expect } from 'vitest'
import { highlightOf, highlightFields } from './productHighlight'

describe('highlightOf', () => {
  it('is none when neither text is set, including blank text', () => {
    expect(highlightOf(null, undefined)).toBe('none')
    expect(highlightOf('  ', '\n')).toBe('none')
  })

  it('picks the one that is set', () => {
    expect(highlightOf('Herbst 2026', '')).toBe('collection')
    expect(highlightOf(null, 'Eine Nacht in Lagos')).toBe('inspiration')
  })

  it('prefers the inspiration story when a product has both', () => {
    expect(highlightOf('Herbst 2026', 'Eine Nacht in Lagos')).toBe('inspiration')
  })
})

describe('highlightFields', () => {
  it('keeps only the chosen text and empties the other', () => {
    expect(highlightFields('collection', 'Herbst 2026', 'Story')).toEqual({ collectionName: 'Herbst 2026', inspirationStory: '' })
    expect(highlightFields('inspiration', 'Herbst 2026', 'Story')).toEqual({ collectionName: '', inspirationStory: 'Story' })
  })

  it('empties both for none', () => {
    expect(highlightFields('none', 'Herbst 2026', 'Story')).toEqual({ collectionName: '', inspirationStory: '' })
  })
})
