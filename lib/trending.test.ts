import { describe, it, expect } from 'vitest'
import { rankByPriority } from './trending'

// Cards carry the id of their product in `productId`; the card's own id is irrelevant to ranking.
const card = (id: string, createdAt: string, productId: string = id) => ({ id, productId, createdAt })

describe('rankByPriority', () => {
  it('orders prioritised products by their priority, the rest newest first', () => {
    const cards = [
      card('1', '2026-01-01'),
      card('2', '2026-03-01'),
      card('3', '2026-02-01'),
      card('4', '2026-04-01'),
    ]
    expect(rankByPriority(cards, ['3', '1']).map(c => c.id)).toEqual(['3', '1', '4', '2'])
  })

  it('keeps all colourway cards of a prioritised product together, in their original order', () => {
    const cards = [
      card('5', '2026-05-01'),
      card('card-a', '2026-01-01', '9'),
      card('card-b', '2026-01-01', '9'),
    ]
    expect(rankByPriority(cards, ['9']).map(c => c.id)).toEqual(['card-a', 'card-b', '5'])
  })

  it('falls back to newest first when there is no priority list', () => {
    const cards = [card('1', '2026-01-01'), card('2', '2026-02-01')]
    expect(rankByPriority(cards, []).map(c => c.id)).toEqual(['2', '1'])
  })
})
