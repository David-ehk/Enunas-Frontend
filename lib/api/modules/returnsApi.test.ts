import { describe, it, expect } from 'vitest'
import { toReturnsWithOrder, flattenReturns, resolveReturnItems, nextAction, returnStageIndex } from './returnsApi'
import type { ApiOrder, ReturnSummary } from '@/types/api'

const ret = (over: Partial<ReturnSummary> = {}): ReturnSummary => ({
  id: 'r-1',
  returnNumber: 'RET-2026-000001',
  status: 'REQUESTED',
  brandId: 'brand-a',
  brandName: 'Brand A',
  shipToAddress: 'Lager A',
  orderItemIds: [],
  ...over,
})

const order = (over: Partial<ApiOrder> = {}): ApiOrder => ({
  id: 'o-1',
  status: 'DELIVERED',
  currency: 'EUR',
  orderNumber: 'ENS-2026-ABC123',
  buyerEmail: 'kunde@example.com',
  createdAt: '2026-01-01T00:00:00Z',
  items: [
    { id: 'i1', quantity: 1, productName: 'Product A' },
    { id: 'i2', quantity: 2, productName: 'Product B' },
    { id: 'i3', quantity: 1, productName: 'Product C' },
  ],
  ...over,
})

describe('nextAction — only the one valid transition is ever offered', () => {
  it('maps each status to its single legal action', () => {
    expect(nextAction('REQUESTED')).toBe('approve')
    expect(nextAction('APPROVED')).toBe('receive')
    expect(nextAction('RECEIVED')).toBe('refund')
  })

  it('offers nothing once refunded', () => {
    expect(nextAction('REFUNDED')).toBeNull()
  })
})

describe('resolveReturnItems', () => {
  it('resolves orderItemIds against the parent order', () => {
    const items = resolveReturnItems(order(), ['i1', 'i3'])
    expect(items.map(i => i.productName)).toEqual(['Product A', 'Product C'])
  })

  it('returns nothing for empty or missing ids', () => {
    expect(resolveReturnItems(order(), [])).toEqual([])
    expect(resolveReturnItems(order(), undefined)).toEqual([])
  })

  it('ignores ids that are not on the order', () => {
    expect(resolveReturnItems(order(), ['does-not-exist'])).toEqual([])
  })
})

describe('multi-brand orders', () => {
  const multi = order({
    returns: [
      ret({ id: 'r-a', returnNumber: 'RET-A', brandId: 'brand-a', brandName: 'Brand A', status: 'APPROVED', orderItemIds: ['i1'], shipToAddress: 'Lager A' }),
      ret({ id: 'r-b', returnNumber: 'RET-B', brandId: 'brand-b', brandName: 'Brand B', status: 'REQUESTED', orderItemIds: ['i2', 'i3'], shipToAddress: 'Lager B' }),
    ],
  })

  it('surfaces both brand returns independently', () => {
    const rows = toReturnsWithOrder(multi)
    expect(rows).toHaveLength(2)
    expect(rows.map(r => r.brandName)).toEqual(['Brand A', 'Brand B'])
    expect(rows.map(r => r.status)).toEqual(['APPROVED', 'REQUESTED'])
  })

  it('gives each brand its own items, address and next action', () => {
    const [a, b] = toReturnsWithOrder(multi)
    expect(a.items.map(i => i.productName)).toEqual(['Product A'])
    expect(b.items.map(i => i.productName)).toEqual(['Product B', 'Product C'])
    expect(a.shipToAddress).toBe('Lager A')
    expect(b.shipToAddress).toBe('Lager B')
    expect(nextAction(a.status)).toBe('receive')
    expect(nextAction(b.status)).toBe('approve')
  })

  it('advancing Brand A does not move Brand B', () => {
    // Simulates the backend echo after approving Brand A only.
    const after = order({
      returns: [
        ret({ id: 'r-a', returnNumber: 'RET-A', brandId: 'brand-a', brandName: 'Brand A', status: 'APPROVED', orderItemIds: ['i1'] }),
        ret({ id: 'r-b', returnNumber: 'RET-B', brandId: 'brand-b', brandName: 'Brand B', status: 'REQUESTED', orderItemIds: ['i2'] }),
      ],
    })
    const b = toReturnsWithOrder(after).find(r => r.brandName === 'Brand B')!
    expect(b.status).toBe('REQUESTED')
    expect(returnStageIndex(b.status)).toBe(0)
  })

  it('refunding one brand leaves the other brand without a refund amount', () => {
    const after = order({
      returns: [
        ret({ returnNumber: 'RET-A', brandName: 'Brand A', status: 'REFUNDED', refundAmount: 189 }),
        ret({ returnNumber: 'RET-B', brandName: 'Brand B', status: 'RECEIVED' }),
      ],
    })
    const [a, b] = toReturnsWithOrder(after)
    expect(a.refundAmount).toBe(189)
    expect(b.refundAmount).toBeUndefined()
  })

  it('carries order context onto every return', () => {
    const [a] = toReturnsWithOrder(multi)
    expect(a.orderId).toBe('o-1')
    expect(a.orderNumber).toBe('ENS-2026-ABC123')
    expect(a.buyerEmail).toBe('kunde@example.com')
    expect(a.currency).toBe('EUR')
  })
})

describe('returns[] is the only source', () => {
  it('yields nothing when returns[] is absent, whatever order.status says', () => {
    expect(toReturnsWithOrder(order({ status: 'RETURN_APPROVED' }))).toEqual([])
    expect(toReturnsWithOrder(order({ status: 'REFUNDED' }))).toEqual([])
    expect(toReturnsWithOrder(order())).toEqual([])
  })

  it('ignores the deprecated scalar return fields entirely', () => {
    const legacy = order({
      status: 'RETURN_REQUESTED',
      returnNumber: 'RET-OLD',
      returnShipToAddress: 'Altes Lager',
      returnReason: 'WRONG_SIZE',
    })
    expect(toReturnsWithOrder(legacy)).toEqual([])
  })

  it('flattens across orders', () => {
    const rows = flattenReturns([
      order({ id: 'o-1', returns: [ret({ returnNumber: 'RET-1' })] }),
      order({ id: 'o-2', returns: [ret({ returnNumber: 'RET-2' }), ret({ returnNumber: 'RET-3' })] }),
      order({ id: 'o-3' }),
    ])
    expect(rows.map(r => r.returnNumber)).toEqual(['RET-1', 'RET-2', 'RET-3'])
    expect(rows.filter(r => r.orderId === 'o-2')).toHaveLength(2)
  })
})
