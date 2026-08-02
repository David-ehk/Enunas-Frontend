import { fetcher } from '../fetcher'
import type { ApiOrder, ApiOrderItem, ReturnStatus, ReturnSummary, ReturnWithOrder } from '@/types/api'

/**
 * Adapter boundary for the returns subsystem.
 *
 * Components consume typed data only — they never construct URLs and never read
 * the deprecated order-scoped return scalars. `OrderResponseDto.returns[]` is the
 * single source of truth; order.status plays no part in return lifecycle.
 */

/** Lifecycle order. Each return advances independently of every other return. */
export const RETURN_LIFECYCLE: ReturnStatus[] = ['REQUESTED', 'APPROVED', 'RECEIVED', 'REFUNDED']

export function returnStageIndex(status: ReturnStatus): number {
  return RETURN_LIFECYCLE.indexOf(status)
}

/** The single action valid in each state. Anything else must not be offered. */
export type ReturnAction = 'approve' | 'receive' | 'refund' | null

export function nextAction(status: ReturnStatus): ReturnAction {
  switch (status) {
    case 'REQUESTED': return 'approve'
    case 'APPROVED':  return 'receive'
    case 'RECEIVED':  return 'refund'
    default:          return null
  }
}

/** Resolves orderItemIds against the parent order's items. */
export function resolveReturnItems(order: ApiOrder, orderItemIds: string[] | undefined): ApiOrderItem[] {
  if (!orderItemIds?.length) return []
  const ids = new Set(orderItemIds.map(String))
  return (order.items ?? []).filter(it => ids.has(String(it.id)))
}

/** Joins every return on an order to that order's context. */
export function toReturnsWithOrder(order: ApiOrder): ReturnWithOrder[] {
  return (order.returns ?? []).map(r => ({
    ...r,
    orderId: order.id,
    orderNumber: order.orderNumber,
    buyerEmail: order.buyerEmail,
    currency: order.currency,
    items: resolveReturnItems(order, r.orderItemIds),
  }))
}

export function flattenReturns(orders: ApiOrder[]): ReturnWithOrder[] {
  return orders.flatMap(toReturnsWithOrder)
}

/** Total already refunded for a brand's return — never derive this from order.total. */
export function refundableAmount(r: ReturnSummary): number | undefined {
  return r.refundAmount
}

export const returnsApi = {
  /** Every return addressed to the signed-in brand. */
  async listForBrand(): Promise<ReturnWithOrder[]> {
    const res = await fetcher<{ content?: ApiOrder[] } | ApiOrder[]>('/brand/orders?page=0&size=100')
    const orders = Array.isArray(res) ? res : (res.content ?? [])
    return flattenReturns(orders)
  },
}
