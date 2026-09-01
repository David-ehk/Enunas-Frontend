// Per-brand revenue assembly for the vendor dashboard.
//
// DESIGN RULE: this module assembles values the backend already computed. It does NOT
// reimplement settlement logic, and it hardcodes no commission or VAT rate. Money the platform
// withholds is a contractual figure owned by the backend ledger; a second implementation here
// would silently drift from it. Anything this module cannot source from an API response is not
// shown as a number at all.
//
// The ledger vocabulary, so the dashboard stops blending two different things:
//
//   grossProductAmount      what customers paid for the brand's items, incl. VAT
//   refundedAmount          what was actually refunded back (backend-computed, per brand)
//   netMerchandiseValue     grossProductAmount − refundedAmount — pure sales volume,
//                           NO commission logic. This is NOT a payout.
//   shippingAmount          shipping collected on the brand's behalf (its own snapshot only)
//   partnerSettlementAmount what the brand is actually paid, AFTER commission. Read straight
//                           from GET /brand/payouts — never derived here.
//
// ATTRIBUTION. GET /brand/orders returns whole orders, including other brands' line items on a
// multi-brand order, so summing an order's `total` credits a brand with revenue it did not earn.
// Everything here works from the brand's OWN line items.
//
// The join key is `variantSku`, because it is one of the few item fields the backend actually
// sends (OrderItemResponseDto sends listingId/productName/variantSku/priceAtPurchase — NOT
// productId/price; see the note on ApiOrderItem in types/api.ts).
//
// KNOWN LIMITATION: nothing guarantees variantSku is unique ACROSS brands — SKUs are
// backend-generated 8-character strings with no documented global constraint. A collision would
// pull another brand's line into this brand's totals. `participatesIn()` narrows the blast
// radius to orders this brand demonstrably has a line on, but the real fix is a brandId (or
// productId) on OrderItemResponseDto. Tracked with the /brand/orders scoping work.

import type { ApiOrder, ApiOrderItem, AdminApiProduct, AdminPayout } from '@/types/api'

/** Round once, at the end, to whole cents — never to whole euros. */
export function toCents(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Orders whose money counts at all: the customer actually paid. PENDING never completed
 * checkout and CANCELLED was called off, so neither is revenue. Refunds are NOT excluded here
 * by status — a refunded order still represents a real sale that later reversed, and the
 * reversal is subtracted as an amount by `refundedAmount()`. Excluding it by status instead
 * would drop the sale and its refund together and quietly understate the month.
 */
const NON_REVENUE_STATUSES = new Set(['PENDING', 'CANCELLED'])

export function isRevenueOrder(order: ApiOrder): boolean {
  return !NON_REVENUE_STATUSES.has(String(order.status))
}

/** Every variant SKU the brand owns — the key used to claim line items off shared orders. */
export function ownSkus(products: AdminApiProduct[]): Set<string> {
  const skus = new Set<string>()
  for (const p of products) {
    for (const v of p.variants ?? []) {
      if (v.sku) skus.add(v.sku)
    }
  }
  return skus
}

/**
 * Does this brand demonstrably have a line on this order? The shipping snapshots carry a real
 * server-provided brandId, so this is a trustworthy participation check — unlike the SKU join.
 */
export function participatesIn(order: ApiOrder, brandId: string | number | null): boolean {
  if (brandId == null) return true // brand identity unknown — fall back to the SKU join alone
  return (order.shippingSnapshots ?? []).some(s => String(s.brandId) === String(brandId))
}

/** The line items on an order that belong to this brand. */
export function ownItems(order: ApiOrder, skus: Set<string>): ApiOrderItem[] {
  return (order.items ?? []).filter(i => i.variantSku != null && skus.has(i.variantSku))
}

/** Gross value of one line item, preferring the backend's own lineTotal. */
export function itemGross(item: ApiOrderItem): number {
  if (item.lineTotal != null) return item.lineTotal
  const unit = item.discountPriceAtPurchase ?? item.priceAtPurchase ?? 0
  return unit * (item.quantity ?? 1)
}

/** What customers paid for this brand's items on one order, incl. VAT. Excludes shipping. */
export function grossProductAmount(order: ApiOrder, skus: Set<string>): number {
  return ownItems(order, skus).reduce((sum, i) => sum + itemGross(i), 0)
}

/**
 * What was actually refunded to the customer for this brand's items on one order.
 * `refundAmount` is computed and frozen by the backend, and each return carries its own
 * brandId — so on a multi-brand order only this brand's reversals are counted.
 */
export function refundedAmount(order: ApiOrder, brandId: string | number | null): number {
  if (brandId == null) return 0
  return (order.returns ?? [])
    .filter(r => String(r.brandId) === String(brandId) && r.status === 'REFUNDED')
    .reduce((sum, r) => sum + (r.refundAmount ?? 0), 0)
}

/**
 * This brand's frozen shipping line. A multi-brand order carries one snapshot per brand, each
 * charged independently, so the brand's own row is the only one it may count.
 */
export function shippingAmount(order: ApiOrder, brandId: string | number | null): number {
  if (brandId == null) return 0
  const snap = (order.shippingSnapshots ?? []).find(s => String(s.brandId) === String(brandId))
  return snap?.amount ?? 0
}

export interface BrandRevenue {
  /** Gross customer spend on this brand's items, incl. VAT, before refunds. */
  grossProductAmount: number
  /** Backend-computed refunds returned to customers for this brand's items. */
  refundedAmount: number
  /** grossProductAmount − refundedAmount. Sales volume. NOT a payout — no commission applied. */
  netMerchandiseValue: number
  /** Shipping collected on this brand's behalf. Reported separately; never commission-liable. */
  shippingAmount: number
}

/** Roll a set of orders up into this brand's ledger lines. Sums raw, rounds once at the end. */
export function summarise(
  orders: ApiOrder[],
  skus: Set<string>,
  brandId: string | number | null,
): BrandRevenue {
  let gross = 0
  let refunded = 0
  let shipping = 0

  for (const order of orders) {
    if (!isRevenueOrder(order) || !participatesIn(order, brandId)) continue
    gross    += grossProductAmount(order, skus)
    refunded += refundedAmount(order, brandId)
    shipping += shippingAmount(order, brandId)
  }

  const grossProduct = toCents(gross)
  const refunds      = toCents(refunded)
  return {
    grossProductAmount:  grossProduct,
    refundedAmount:      refunds,
    netMerchandiseValue: toCents(grossProduct - refunds),
    shippingAmount:      toCents(shipping),
  }
}

/**
 * What the brand is actually owed, straight from the backend's own payout records — the only
 * place a commission-adjusted figure may come from. Returns null when no payout has been
 * generated yet, so the dashboard can say "not yet settled" instead of inventing a number.
 */
export function partnerSettlementAmount(payouts: AdminPayout[]): number | null {
  const outstanding = payouts.filter(p => p.status === 'PENDING' || p.status === 'APPROVED')
  if (outstanding.length === 0) return null
  return toCents(outstanding.reduce((sum, p) => sum + (p.amount ?? 0), 0))
}
