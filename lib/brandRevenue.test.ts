import { describe, it, expect } from 'vitest'
import {
  toCents, isRevenueOrder, ownSkus, ownItems, itemGross, participatesIn,
  grossProductAmount, refundedAmount, shippingAmount, summarise, partnerSettlementAmount,
} from './brandRevenue'
import type { ApiOrder, AdminApiProduct, AdminPayout } from '@/types/api'

// Order ENS-2026-M2BDZ5 exactly as GET /brand/orders returned it on 29 Aug 2026: one order,
// two brands, both items refunded. Field shapes are the backend's real ones — variantSku
// present, productId absent, per-brand returns carrying their own brandId and refundAmount.
const order = (over: Partial<ApiOrder> = {}): ApiOrder => ({
  id: '5',
  status: 'REFUNDED',
  currency: 'EUR',
  orderNumber: 'ENS-2026-M2BDZ5',
  createdAt: '2026-08-29T14:32:36Z',
  total: 129.88,
  subtotal: 119.90,
  shippingTotal: 9.98,
  items: [
    { id: '5', quantity: 1, productName: 'E2E Alpha Hoodie', variantSku: 'QXGXMUSV', priceAtPurchase: 89.95, lineTotal: 89.95 },
    { id: '6', quantity: 1, productName: 'E2E Beta Tee',     variantSku: 'GVNKCH8T', priceAtPurchase: 29.95, lineTotal: 29.95 },
  ],
  shippingSnapshots: [
    { brandId: 3, brandName: 'Claude E2E Brand A', amount: 4.99, currency: 'EUR', calculationMethod: 'GLOBAL_DEFAULT' },
    { brandId: 4, brandName: 'Claude E2E Brand B', amount: 4.99, currency: 'EUR', calculationMethod: 'GLOBAL_DEFAULT' },
  ],
  returns: [
    { id: '1', returnNumber: 'RET-2026-WNDQID', status: 'REFUNDED', brandId: '3', brandName: 'Claude E2E Brand A', shipToAddress: 'A', orderItemIds: ['5'], refundAmount: 89.95 },
    { id: '2', returnNumber: 'RET-2026-5YY0SZ', status: 'REFUNDED', brandId: '4', brandName: 'Claude E2E Brand B', shipToAddress: 'B', orderItemIds: ['6'], refundAmount: 29.95 },
  ],
  ...over,
})

const productsA = (): AdminApiProduct[] => ([
  { id: '3', name: 'E2E Alpha Hoodie', variants: [{ id: '3', sku: 'QXGXMUSV', size: 'M', color: 'BLACK', stockQuantity: 50 }] } as unknown as AdminApiProduct,
])
const skusA = () => ownSkus(productsA())

describe('per-brand attribution', () => {
  it("claims only the brand's own line items off a shared order", () => {
    expect(ownItems(order(), skusA()).map(i => i.productName)).toEqual(['E2E Alpha Hoodie'])
  })

  it("never credits a brand with another brand's revenue", () => {
    const o = order()
    expect(grossProductAmount(o, skusA())).toBe(89.95)
    // The bug this replaces: summing the order total credited Brand A with all 129.88.
    expect(grossProductAmount(o, skusA())).not.toBe(o.total)
  })

  it("counts only the brand's own shipping snapshot", () => {
    const o = order()
    expect(shippingAmount(o, 3)).toBe(4.99)
    expect(shippingAmount(o, 3)).not.toBe(o.shippingTotal)
    expect(shippingAmount(o, 999)).toBe(0)
  })

  it("counts only the brand's own refunds", () => {
    expect(refundedAmount(order(), 3)).toBe(89.95)
    expect(refundedAmount(order(), 4)).toBe(29.95)
    expect(refundedAmount(order(), 999)).toBe(0)
  })

  it('ignores refunds that have not actually been paid out yet', () => {
    const o = order({ returns: [
      { id: '1', returnNumber: 'R1', status: 'REQUESTED', brandId: '3', brandName: 'A', shipToAddress: 'A', orderItemIds: ['5'], refundAmount: 89.95 },
    ] })
    expect(refundedAmount(o, 3)).toBe(0)
  })

  it('ignores items with no SKU rather than guessing', () => {
    const o = order({ items: [{ id: '7', quantity: 1, productName: 'Mystery', lineTotal: 50 }] })
    expect(grossProductAmount(o, skusA())).toBe(0)
  })

  it('falls back to unit price × quantity when lineTotal is absent', () => {
    expect(itemGross({ id: '1', quantity: 3, priceAtPurchase: 10.5 })).toBe(31.5)
    expect(itemGross({ id: '1', quantity: 2, priceAtPurchase: 10, discountPriceAtPurchase: 8 })).toBe(16)
  })

  it('uses the server-provided brandId to confirm the brand is on the order', () => {
    expect(participatesIn(order(), 3)).toBe(true)
    expect(participatesIn(order(), 999)).toBe(false)
    // Unknown brand identity must not silently exclude everything.
    expect(participatesIn(order(), null)).toBe(true)
  })
})

describe('revenue definition', () => {
  it('excludes orders the customer never paid for', () => {
    expect(isRevenueOrder(order({ status: 'PENDING' }))).toBe(false)
    expect(isRevenueOrder(order({ status: 'CANCELLED' }))).toBe(false)
  })

  it('still counts a refunded order as a sale, then subtracts the refund', () => {
    // Excluding REFUNDED by status would drop the sale AND its reversal together.
    expect(isRevenueOrder(order({ status: 'REFUNDED' }))).toBe(true)
    const r = summarise([order()], skusA(), 3)
    expect(r.grossProductAmount).toBe(89.95)
    expect(r.refundedAmount).toBe(89.95)
    expect(r.netMerchandiseValue).toBe(0)
  })

  it('reduces revenue on a partial refund', () => {
    const o = order({ returns: [
      { id: '1', returnNumber: 'R1', status: 'REFUNDED', brandId: '3', brandName: 'A', shipToAddress: 'A', orderItemIds: ['5'], refundAmount: 30 },
    ] })
    const r = summarise([o], skusA(), 3)
    expect(r.netMerchandiseValue).toBe(59.95)
  })

  it('does not let another brand\'s refund reduce this brand\'s revenue', () => {
    // Brand A's own item is NOT refunded here; only Brand B's is.
    const o = order({ returns: [
      { id: '2', returnNumber: 'R2', status: 'REFUNDED', brandId: '4', brandName: 'B', shipToAddress: 'B', orderItemIds: ['6'], refundAmount: 29.95 },
    ] })
    expect(summarise([o], skusA(), 3).netMerchandiseValue).toBe(89.95)
  })
})

describe('summarise — cross-checked against GET /admin/settlements', () => {
  // Settlement row for Brand A after both refunds, 29 Aug 2026:
  //   commissionGross 0.00, shippingRevenue 4.99, payoutAmount 4.99
  // Commission reversed to zero on refund, brand keeps the shipping. So the merchandise value
  // must be 0 and the shipping line must stand alone at 4.99.
  it('matches the Brand A settlement row exactly', () => {
    const r = summarise([order()], skusA(), 3)
    expect(r.netMerchandiseValue).toBe(0)
    expect(r.shippingAmount).toBe(4.99)
    expect(toCents(r.netMerchandiseValue + r.shippingAmount)).toBe(4.99) // = payoutAmount
  })

  it('matches the Brand B settlement row exactly', () => {
    const productsB = [{ id: '4', name: 'E2E Beta Tee', variants: [{ id: '4', sku: 'GVNKCH8T', size: 'L', color: 'WHITE', stockQuantity: 30 }] } as unknown as AdminApiProduct]
    const r = summarise([order()], ownSkus(productsB), 4)
    expect(r.grossProductAmount).toBe(29.95)
    expect(r.netMerchandiseValue).toBe(0)
    expect(r.shippingAmount).toBe(4.99)
  })

  it('keeps cents rather than rounding to whole euros', () => {
    const o = order({ returns: [] })
    const r = summarise([o], skusA(), 3)
    expect(r.netMerchandiseValue).toBe(89.95)
    expect(Number.isInteger(r.netMerchandiseValue)).toBe(false)
  })

  it('sums raw and rounds once, so many small lines do not drift', () => {
    const cents = (n: number) => order({
      id: String(n), returns: [],
      items: [{ id: 'x', quantity: 1, variantSku: 'QXGXMUSV', lineTotal: 0.1 }],
    })
    const r = summarise([cents(1), cents(2), cents(3)], skusA(), 3)
    expect(r.grossProductAmount).toBe(0.3) // 0.1*3 = 0.30000000000000004 unrounded
  })
})

describe('partnerSettlementAmount — backend-owned, never derived', () => {
  const payout = (over: Partial<AdminPayout> = {}): AdminPayout => ({
    id: 'p1', type: 'REVENUE', amount: 78.74, status: 'PENDING', currency: 'EUR',
    createdAt: '2026-08-29T00:00:00Z', ...over,
  })

  it('returns null when nothing has been generated, so the UI shows no invented figure', () => {
    expect(partnerSettlementAmount([])).toBeNull()
  })

  it('sums the outstanding REVENUE and SHIPPING transfers the backend computed', () => {
    expect(partnerSettlementAmount([
      payout({ id: 'p1', type: 'REVENUE', amount: 73.75 }),
      payout({ id: 'p2', type: 'SHIPPING', amount: 4.99 }),
    ])).toBe(78.74)
  })

  it('ignores payouts already settled or cancelled', () => {
    expect(partnerSettlementAmount([
      payout({ id: 'p1', amount: 50, status: 'PAID' }),
      payout({ id: 'p2', amount: 25, status: 'CANCELLED' }),
    ])).toBeNull()
  })
})
