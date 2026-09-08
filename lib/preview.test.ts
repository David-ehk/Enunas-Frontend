import { describe, it, expect } from 'vitest'
import {
  previewReleaseMs, isWithinDays, partitionPreview,
  formatReleaseDate, formatReleaseDateShort,
} from './preview'

const DAY = 86_400_000
// Fixed "now": 2026-09-08T12:00:00Z
const NOW = Date.UTC(2026, 8, 8, 12, 0, 0)

describe('previewReleaseMs', () => {
  it('is UTC midnight of the release date', () => {
    expect(previewReleaseMs('2026-10-01')).toBe(Date.UTC(2026, 9, 1))
  })
})

describe('isWithinDays', () => {
  it('true when the release is inside the window', () => {
    expect(isWithinDays('2026-09-14', 7, NOW)).toBe(true)   // ~6 days out
  })
  it('false when the release is beyond the window', () => {
    expect(isWithinDays('2026-09-20', 7, NOW)).toBe(false)  // ~12 days out
  })
  it('true for a release already in the past (0 or negative distance)', () => {
    expect(isWithinDays('2026-09-01', 7, NOW)).toBe(true)
  })
})

const live = (id: string) => ({ id, preview: false as const, releaseDate: null })
const soon = (id: string, releaseDate: string) => ({ id, preview: true as const, releaseDate })

describe('partitionPreview', () => {
  it('hide: drops every preview item', () => {
    const out = partitionPreview([live('a'), soon('b', '2026-09-10'), live('c')], 'hide', NOW)
    expect(out.map(x => x.id)).toEqual(['a', 'c'])
  })

  it('window7: keeps near previews, drops far ones', () => {
    const out = partitionPreview(
      [live('a'), soon('b', '2026-09-11'), soon('c', '2026-12-01')],
      'window7', NOW,
    )
    expect(out.map(x => x.id)).toEqual(['a', 'b'])
  })

  it('show: keeps all previews', () => {
    const out = partitionPreview([live('a'), soon('b', '2026-12-01')], 'show', NOW)
    expect(out.map(x => x.id)).toEqual(['a', 'b'])
  })

  it('always orders live items before preview items, preserving order within each group', () => {
    const out = partitionPreview(
      [soon('x', '2026-09-10'), live('a'), soon('y', '2026-09-11'), live('b')],
      'show', NOW,
    )
    expect(out.map(x => x.id)).toEqual(['a', 'b', 'x', 'y'])
  })
})

describe('date formatting (de-DE)', () => {
  it('formatReleaseDate includes the year', () => {
    expect(formatReleaseDate('2026-10-01')).toBe('1. Oktober 2026')
  })
  it('formatReleaseDateShort omits the year', () => {
    expect(formatReleaseDateShort('2026-10-01')).toBe('1. Oktober')
  })
})
