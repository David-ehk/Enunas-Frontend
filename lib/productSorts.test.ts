import { describe, it, expect } from 'vitest'
import { STANDARD_SORTS, BROWSE_SORTS, trendingSort, resolveSort } from './productSorts'

const card = (productId: string, productName: string, price: string, createdAt: string) =>
  ({ id: productId, productId, productName, price, createdAt })

const cards = [
  card('1', 'Mantel', '120,00€', '2026-01-01'),
  card('2', 'Anzug', '1.299,00€', '2026-03-01'),
  card('3', 'Zopfpullover', '59,95€', '2026-02-01'),
]

const run = (id: string) => resolveSort(STANDARD_SORTS, id).apply(cards).map(c => c.productId)

describe('STANDARD_SORTS', () => {
  it('lists the four shop sorts with newest first as the default', () => {
    expect(STANDARD_SORTS.map(s => s.id)).toEqual(['neu', 'preis-auf', 'preis-ab', 'name'])
  })

  it('sorts newest first', () => {
    expect(run('neu')).toEqual(['2', '3', '1'])
  })

  it('sorts by German-formatted price in both directions', () => {
    expect(run('preis-auf')).toEqual(['3', '1', '2'])
    expect(run('preis-ab')).toEqual(['2', '1', '3'])
  })

  it('sorts by name', () => {
    expect(run('name')).toEqual(['2', '1', '3'])
  })

  it('does not mutate the input list', () => {
    run('preis-auf')
    expect(cards.map(c => c.productId)).toEqual(['1', '2', '3'])
  })
})

describe('resolveSort', () => {
  it('falls back to the first sort of the list for an unknown or empty id', () => {
    expect(resolveSort(STANDARD_SORTS, '').id).toBe('neu')
    expect(resolveSort([trendingSort([]), ...STANDARD_SORTS], '').id).toBe('trendy')
  })
})

describe('trendingSort', () => {
  it('puts the priority products first, then the rest newest first', () => {
    expect(trendingSort(['1']).apply(cards).map(c => c.productId)).toEqual(['1', '2', '3'])
  })
})

describe('BROWSE_SORTS (/bekleidung)', () => {
  it('offers no "Neuheiten": new arrivals live on /neu', () => {
    expect(BROWSE_SORTS.map(s => s.label)).toEqual(['Empfohlen', 'Preis aufsteigend', 'Preis absteigend', 'Name A–Z'])
  })

  it('keeps the incoming product order by default', () => {
    expect(resolveSort(BROWSE_SORTS, '').apply(cards).map(c => c.productId)).toEqual(['1', '2', '3'])
  })
})
