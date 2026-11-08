import { fetcher } from '../fetcher'
import type {
  ApiOrder, ApiOrderItem, ReturnLine, ReturnReason, ReturnRefundState, ReturnStatus, ReturnSummary, ReturnWithOrder,
} from '@/types/api'
import type { ReturnRequestDto } from './orderApi'
import { isItemActive } from '@/lib/orderItemCancellation'
import { formatEuro } from '@/lib/format'

/**
 * Adapter boundary for the returns subsystem.
 *
 * Components consume typed data only — they never construct URLs and never read
 * the deprecated order-scoped return scalars. `OrderResponseDto.returns[]` is the
 * single source of truth; order.status plays no part in return lifecycle.
 *
 * A return carries the physical `status` (REQUESTED → APPROVED → RECEIVED → REFUNDED) and,
 * separately, the money side `refundState` (null → PENDING → REFUNDED | FAILED). A return can
 * hold only some units of an order line (`items[].quantityReturned`).
 */

/** Lifecycle order. Each return advances independently of every other return. */
export const RETURN_LIFECYCLE: ReturnStatus[] = ['REQUESTED', 'APPROVED', 'RECEIVED', 'REFUNDED']

export function returnStageIndex(status: ReturnStatus): number {
  return RETURN_LIFECYCLE.indexOf(status)
}

/** German label for each lifecycle stage — the one wording admin and vendor both show. */
export const RETURN_STAGE_LABELS: Record<ReturnStatus, string> = {
  REQUESTED: 'Beantragt', APPROVED: 'Genehmigt', RECEIVED: 'Eingegangen', REFUNDED: 'Erstattet',
}

/**
 * The single next admin step for a return. Anything else must not be offered.
 * - release: send the refund (RECEIVED; an APPROVED return can also be released by override)
 * - refresh: a released refund awaits Mollie's confirmation — re-check, never release again
 * - resend:  Mollie reported the refund failed — release again (same amount)
 */
export type ReturnAction = 'approve' | 'receive' | 'release' | 'refresh' | 'resend' | null

export function adminReturnAction(r: Pick<ReturnSummary, 'status' | 'refundState'>): ReturnAction {
  if (r.status === 'REFUNDED' || r.refundState === 'REFUNDED') return null
  if (r.refundState === 'PENDING') return 'refresh'
  if (r.refundState === 'FAILED') return 'resend'
  switch (r.status) {
    case 'REQUESTED': return 'approve'
    case 'APPROVED':  return 'receive'
    case 'RECEIVED':  return 'release'
    default:          return null
  }
}

/** "Ware erhalten" for the brand: an approved return, or one refunded by override before the goods arrived. */
export function brandCanConfirmReceipt(r: Pick<ReturnSummary, 'status' | 'receivedAt'>): boolean {
  return r.status === 'APPROVED' || (r.status === 'REFUNDED' && !r.receivedAt)
}

/** The money state every view shows. Returns refunded before refundState existed only carry status REFUNDED. */
export function effectiveRefundState(r: Pick<ReturnSummary, 'status' | 'refundState'>): ReturnRefundState | null {
  return r.refundState ?? (r.status === 'REFUNDED' ? 'REFUNDED' : null)
}

/** Customer-facing refund line, or null while no refund has been released. */
export function customerRefundText(r: Pick<ReturnSummary, 'status' | 'refundState' | 'refundAmount'>): string | null {
  switch (effectiveRefundState(r)) {
    case 'PENDING':  return 'Erstattung wird bearbeitet'
    case 'REFUNDED': return r.refundAmount != null ? `Erstattet: ${formatEuro(r.refundAmount)}` : 'Erstattet'
    case 'FAILED':   return 'Erstattung wird erneut veranlasst'
    default:         return null
  }
}

/** Resolves orderItemIds against the parent order's items. */
export function resolveReturnItems(order: ApiOrder, orderItemIds: string[] | undefined): ApiOrderItem[] {
  if (!orderItemIds?.length) return []
  const ids = new Set(orderItemIds.map(String))
  return (order.items ?? []).filter(it => ids.has(String(it.id)))
}

/** Units of each order line on one return. A return without `items` (older backend) holds whole lines. */
function unitsByItem(r: ReturnSummary, order: ApiOrder): Map<string, number> {
  if (r.items?.length) return new Map(r.items.map(i => [String(i.orderItemId), i.quantityReturned]))
  return new Map(resolveReturnItems(order, r.orderItemIds).map(it => [String(it.id), it.quantity]))
}

function resolveReturnLines(order: ApiOrder, r: ReturnSummary): ReturnLine[] {
  const units = unitsByItem(r, order)
  return (order.items ?? [])
    .filter(it => units.has(String(it.id)))
    .map(it => ({ ...it, quantityReturned: units.get(String(it.id)) ?? it.quantity }))
}

/** Joins every return on an order to that order's context. */
export function toReturnsWithOrder(order: ApiOrder): ReturnWithOrder[] {
  return (order.returns ?? []).map(r => ({
    ...r,
    orderId: order.id,
    orderNumber: order.orderNumber,
    buyerEmail: order.buyerEmail,
    currency: order.currency,
    lines: resolveReturnLines(order, r),
  }))
}

export function flattenReturns(orders: ApiOrder[]): ReturnWithOrder[] {
  return orders.flatMap(toReturnsWithOrder)
}

/** Units of one order line the customer can still return: ordered − units on any return. */
export function remainingReturnableQuantity(order: ApiOrder, orderItemId: string): number {
  const item = (order.items ?? []).find(it => String(it.id) === String(orderItemId))
  if (!item || !isItemActive(item)) return 0
  const onReturns = (order.returns ?? [])
    .reduce((sum, r) => sum + (unitsByItem(r, order).get(String(orderItemId)) ?? 0), 0)
  return Math.max(0, item.quantity - onReturns)
}

// Order statuses from which the customer may (still) return units. The backend enforces the
// 14-day window and the per-brand rules; this only decides whether the form is offered.
const RETURNABLE_ORDER_STATUSES = ['DELIVERED', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED']

/** Lines the customer can still return, with the units left on each. */
export function returnableLines(order: ApiOrder): (ApiOrderItem & { remaining: number })[] {
  if (!RETURNABLE_ORDER_STATUSES.includes(String(order.status))) return []
  return (order.items ?? [])
    .map(it => ({ ...it, remaining: remainingReturnableQuantity(order, it.id) }))
    .filter(it => it.remaining > 0)
}

/** Request body for one line. `quantity` is sent only for a real partial return — omitted means "all remaining". */
export function buildReturnRequest(args: {
  orderItemId: string
  quantity: number
  remaining: number
  reason: ReturnReason
  description?: string
}): ReturnRequestDto {
  const description = args.description?.trim()
  return {
    orderItemId: Number(args.orderItemId),
    ...(args.quantity < args.remaining ? { quantity: args.quantity } : {}),
    reason: args.reason,
    ...(description ? { description } : {}),
  }
}

export const returnsApi = {
  /** Every return addressed to the signed-in brand. */
  async listForBrand(): Promise<ReturnWithOrder[]> {
    const res = await fetcher<{ content?: ApiOrder[] } | ApiOrder[]>('/brand/orders?page=0&size=100')
    const orders = Array.isArray(res) ? res : (res.content ?? [])
    return flattenReturns(orders)
  },

  /** "Ware erhalten": APPROVED → RECEIVED (restores stock). Answers with the brand-scoped order. */
  async confirmReceived(returnNumber: string): Promise<ApiOrder> {
    return fetcher<ApiOrder>(`/brand/returns/${encodeURIComponent(returnNumber)}/receive`, { method: 'POST' })
  },
}
