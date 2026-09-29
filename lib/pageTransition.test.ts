import { describe, it, expect } from 'vitest'
import { resolveTransitionTarget } from './pageTransition'

const base = {
  currentUrl: 'https://enunas.com/neu?sort=asc',
  target: null,
  download: false,
  button: 0,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
}

describe('resolveTransitionTarget', () => {
  it('returns path, search and hash for an internal link to another page', () => {
    expect(resolveTransitionTarget({ ...base, href: 'https://enunas.com/marken?x=1#top' })).toBe('/marken?x=1#top')
  })

  it('skips links to another origin', () => {
    expect(resolveTransitionTarget({ ...base, href: 'https://example.com/marken' })).toBeNull()
  })

  it('skips mailto and tel links', () => {
    expect(resolveTransitionTarget({ ...base, href: 'mailto:info@enunas.com' })).toBeNull()
    expect(resolveTransitionTarget({ ...base, href: 'tel:+4989123' })).toBeNull()
  })

  it('skips links that stay on the current page (query or hash change only)', () => {
    expect(resolveTransitionTarget({ ...base, href: 'https://enunas.com/neu?sort=desc' })).toBeNull()
    expect(resolveTransitionTarget({ ...base, href: 'https://enunas.com/neu#grid' })).toBeNull()
  })

  it('skips modified clicks and non-primary buttons', () => {
    expect(resolveTransitionTarget({ ...base, href: 'https://enunas.com/marken', metaKey: true })).toBeNull()
    expect(resolveTransitionTarget({ ...base, href: 'https://enunas.com/marken', ctrlKey: true })).toBeNull()
    expect(resolveTransitionTarget({ ...base, href: 'https://enunas.com/marken', shiftKey: true })).toBeNull()
    expect(resolveTransitionTarget({ ...base, href: 'https://enunas.com/marken', altKey: true })).toBeNull()
    expect(resolveTransitionTarget({ ...base, href: 'https://enunas.com/marken', button: 1 })).toBeNull()
  })

  it('skips new-tab and download links', () => {
    expect(resolveTransitionTarget({ ...base, href: 'https://enunas.com/marken', target: '_blank' })).toBeNull()
    expect(resolveTransitionTarget({ ...base, href: 'https://enunas.com/agb.pdf', download: true })).toBeNull()
  })

  it('skips product pages (/bekleidung/[brand]/[slug]) but not catalogue pages', () => {
    expect(resolveTransitionTarget({ ...base, href: 'https://enunas.com/bekleidung/nike/air-max' })).toBeNull()
    expect(resolveTransitionTarget({ ...base, href: 'https://enunas.com/bekleidung/nike/air-max?c=red' })).toBeNull()
    expect(resolveTransitionTarget({ ...base, href: 'https://enunas.com/bekleidung/nike' })).toBe('/bekleidung/nike')
    expect(resolveTransitionTarget({ ...base, href: 'https://enunas.com/bekleidung' })).toBe('/bekleidung')
  })
})
