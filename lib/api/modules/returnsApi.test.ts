import { describe, it, expect } from 'vitest'
import {
  toReturnsWithOrder, flattenReturns, resolveReturnItems, adminReturnAction, returnStageIndex,
  remainingReturnableQuantity, buildReturnRequest, brandCanConfirmReceipt, customerRefundText, returnableLines, effectiveRefundState,
} from './returnsApi'
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

// Contract of 7 Oct 2026: the refund is "released" (POST …/release-refund) and only counts as
// done once Mollie confirms; until then refundState is PENDING, and a FAILED refund is resent.
describe('adminReturnAction — only the one valid next step is ever offered', () => {
  it('maps each physical status to its legal action while no refund is released', () => {
    expect(adminReturnAction(ret({ status: 'REQUESTED' }))).toBe('approve')
    expect(adminReturnAction(ret({ status: 'APPROVED' }))).toBe('receive')
    expect(adminReturnAction(ret({ status: 'RECEIVED' }))).toBe('release')
  })

  it('checks a released-but-unconfirmed refund instead of releasing it again', () => {
    expect(adminReturnAction(ret({ status: 'RECEIVED', refundState: 'PENDING' }))).toBe('refresh')
    expect(adminReturnAction(ret({ status: 'APPROVED', refundState: 'PENDING' }))).toBe('refresh')
  })

  it('resends a failed refund', () => {
    expect(adminReturnAction(ret({ status: 'RECEIVED', refundState: 'FAILED' }))).toBe('resend')
  })

  it('offers nothing once refunded', () => {
    expect(adminReturnAction(ret({ status: 'REFUNDED', refundState: 'REFUNDED' }))).toBeNull()
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
    expect(a.lines.map(i => i.productName)).toEqual(['Product A'])
    expect(b.lines.map(i => i.productName)).toEqual(['Product B', 'Product C'])
    expect(a.shipToAddress).toBe('Lager A')
    expect(b.shipToAddress).toBe('Lager B')
    expect(adminReturnAction(a)).toBe('receive')
    expect(adminReturnAction(b)).toBe('approve')
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

// ── Partial returns (backend contract of 7 Oct 2026) ─────────────────────────
// returns[].items = [{ orderItemId, quantityReturned }]; orderItemIds stays for compatibility.

describe('return lines carry the returned quantity', () => {
  it('uses quantityReturned from returns[].items', () => {
    const o = order({ returns: [ret({ orderItemIds: ['i2'], items: [{ orderItemId: 'i2', quantityReturned: 1 }] })] })
    const [r] = toReturnsWithOrder(o)
    expect(r.lines).toHaveLength(1)
    expect(r.lines[0].productName).toBe('Product B')
    expect(r.lines[0].quantity).toBe(2)          // ordered
    expect(r.lines[0].quantityReturned).toBe(1)  // on this return
  })

  it('treats a return without items[] (older backend) as the whole line', () => {
    const o = order({ returns: [ret({ orderItemIds: ['i2'] })] })
    expect(toReturnsWithOrder(o)[0].lines[0].quantityReturned).toBe(2)
  })

  it('matches numeric orderItemIds from the backend against string item ids', () => {
    const o = order({ returns: [ret({ items: [{ orderItemId: 3 as unknown as string, quantityReturned: 1 }] })], items: [{ id: '3', quantity: 2, productName: 'Shirt' }] })
    expect(toReturnsWithOrder(o)[0].lines.map(l => l.productName)).toEqual(['Shirt'])
  })
})

describe('remainingReturnableQuantity', () => {
  it('is the ordered quantity when nothing was returned yet', () => {
    expect(remainingReturnableQuantity(order(), 'i2')).toBe(2)
  })

  it('subtracts units already on any return of the order', () => {
    const o = order({ returns: [
      ret({ returnNumber: 'RET-1', items: [{ orderItemId: 'i2', quantityReturned: 1 }] }),
    ] })
    expect(remainingReturnableQuantity(o, 'i2')).toBe(1)
  })

  it('is 0 once every unit is on a return, never negative', () => {
    const o = order({ returns: [
      ret({ returnNumber: 'RET-1', items: [{ orderItemId: 'i2', quantityReturned: 1 }] }),
      ret({ returnNumber: 'RET-2', items: [{ orderItemId: 'i2', quantityReturned: 2 }] }),
    ] })
    expect(remainingReturnableQuantity(o, 'i2')).toBe(0)
  })

  it('counts a legacy return (orderItemIds only) as the whole line', () => {
    expect(remainingReturnableQuantity(order({ returns: [ret({ orderItemIds: ['i2'] })] }), 'i2')).toBe(0)
  })

  it('is 0 for a line cancelled before shipping', () => {
    const o = order({ items: [{ id: 'i1', quantity: 2, productName: 'A', cancellationState: 'CANCELLED' }] })
    expect(remainingReturnableQuantity(o, 'i1')).toBe(0)
  })
})

describe('buildReturnRequest — quantity only when it is a real partial return', () => {
  it('omits quantity when the customer returns every remaining unit', () => {
    expect(buildReturnRequest({ orderItemId: '41', quantity: 2, remaining: 2, reason: 'WRONG_SIZE' }))
      .toEqual({ orderItemId: 41, reason: 'WRONG_SIZE' })
  })

  it('sends quantity for fewer units than remain', () => {
    expect(buildReturnRequest({ orderItemId: '41', quantity: 1, remaining: 2, reason: 'WRONG_SIZE' }))
      .toEqual({ orderItemId: 41, quantity: 1, reason: 'WRONG_SIZE' })
  })

  it('includes a trimmed description and drops an empty one', () => {
    expect(buildReturnRequest({ orderItemId: '41', quantity: 1, remaining: 1, reason: 'OTHER', description: '  zu klein  ' }))
      .toEqual({ orderItemId: 41, reason: 'OTHER', description: 'zu klein' })
    expect(buildReturnRequest({ orderItemId: '41', quantity: 1, remaining: 1, reason: 'OTHER', description: '   ' }))
      .toEqual({ orderItemId: 41, reason: 'OTHER' })
  })
})

describe('brandCanConfirmReceipt — "Ware erhalten"', () => {
  it('is offered on an approved return', () => {
    expect(brandCanConfirmReceipt(ret({ status: 'APPROVED' }))).toBe(true)
  })

  it('is offered on a refund released by admin override before the goods arrived', () => {
    expect(brandCanConfirmReceipt(ret({ status: 'REFUNDED', receivedAt: undefined }))).toBe(true)
  })

  it('is not offered before approval or once the goods are recorded', () => {
    expect(brandCanConfirmReceipt(ret({ status: 'REQUESTED' }))).toBe(false)
    expect(brandCanConfirmReceipt(ret({ status: 'RECEIVED', receivedAt: '2026-10-07T10:00:00Z' }))).toBe(false)
    expect(brandCanConfirmReceipt(ret({ status: 'REFUNDED', receivedAt: '2026-10-07T10:00:00Z' }))).toBe(false)
  })
})

describe('customerRefundText', () => {
  it('says the refund is being processed while Mollie has not confirmed', () => {
    expect(customerRefundText(ret({ status: 'RECEIVED', refundState: 'PENDING', refundAmount: 69.95 }))).toBe('Erstattung wird bearbeitet')
  })

  it('names the refunded amount once confirmed', () => {
    expect(customerRefundText(ret({ status: 'REFUNDED', refundState: 'REFUNDED', refundAmount: 69.95 }))).toBe('Erstattet: 69,95 €')
  })

  it('says nothing about money before a refund is released', () => {
    expect(customerRefundText(ret({ status: 'APPROVED' }))).toBeNull()
  })
})

// The customer form used to open only while order.status === DELIVERED. After a first partial
// return the order moves to RETURN_*, so the second unit could never be returned from the UI.
describe('returnableLines', () => {
  const withFirstUnitReturned = (status: string) => order({
    status,
    returns: [ret({ items: [{ orderItemId: 'i2', quantityReturned: 1 }] })],
  })

  it('offers every line with units left on a delivered order', () => {
    expect(returnableLines(order()).map(l => [l.id, l.remaining])).toEqual([['i1', 1], ['i2', 2], ['i3', 1]])
  })

  it('still offers the remaining unit after a first partial return', () => {
    for (const status of ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED']) {
      const lines = returnableLines(withFirstUnitReturned(status))
      expect(lines.find(l => l.id === 'i2')?.remaining).toBe(1)
    }
  })

  it('offers nothing before delivery', () => {
    for (const status of ['PAID', 'SHIPPED', 'PENDING']) {
      expect(returnableLines(order({ status }))).toEqual([])
    }
  })
})

// Returns refunded before refundState existed (e.g. RET-2026-1FVC6C on 30 Sep 2026) carry only
// status REFUNDED + refundAmount — they must still tell the customer they were refunded.
describe('customerRefundText — returns refunded before refundState existed', () => {
  it('falls back to the physical REFUNDED status', () => {
    expect(customerRefundText(ret({ status: 'REFUNDED', refundAmount: 69.95 }))).toBe('Erstattet: 69,95 €')
  })
})

// One rule for every view (admin row, customer text): a return refunded before refundState
// existed counts as REFUNDED. Seen on 9 Oct 2026: admin rows of old refunds had lost their amount.
describe('effectiveRefundState', () => {
  it('uses refundState when the backend sends it', () => {
    expect(effectiveRefundState(ret({ status: 'RECEIVED', refundState: 'PENDING' }))).toBe('PENDING')
  })

  it('treats an old REFUNDED return without refundState as REFUNDED', () => {
    expect(effectiveRefundState(ret({ status: 'REFUNDED' }))).toBe('REFUNDED')
  })

  it('is null while nothing was released', () => {
    expect(effectiveRefundState(ret({ status: 'RECEIVED' }))).toBeNull()
  })
})
