import { describe, it, expect } from 'vitest'
import { byNewest } from './newestProducts'

// "Neuheiten" sort on /neu and the catalogue pages: chosen by default but never applied, so the
// newest products came last (30 Sep 2026 E2E run). Used like the price/name comparators beside it.
const p = (id: string, createdAt?: string | Date) => ({ id, createdAt })

describe('byNewest', () => {
  it('orders newest first, however the input is ordered', () => {
    const list = [p('old', '2026-01-01'), p('newest', '2026-09-30'), p('mid', '2026-05-01')]
    expect([...list].sort(byNewest).map(x => x.id)).toEqual(['newest', 'mid', 'old'])
  })

  it('accepts Date values as well as ISO strings', () => {
    const list = [p('old', new Date('2026-01-01')), p('new', '2026-02-01')]
    expect([...list].sort(byNewest).map(x => x.id)).toEqual(['new', 'old'])
  })

  it('puts items without a createdAt last', () => {
    const list = [p('undated'), p('dated', '2026-01-01')]
    expect([...list].sort(byNewest).map(x => x.id)).toEqual(['dated', 'undated'])
  })
})
