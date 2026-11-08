import { fetcher } from '../fetcher'
import { flattenReturns } from './returnsApi'
import { RECONCILE_ELIGIBLE_AFTER_MS } from '@/lib/orderItemCancellation'
import type {
  ApiOrder, ApiPage, OrderRefundPreview, ReconcileRefundAction, RefundDashboardState,
  RefundOverviewRow, RefundPreview, ReturnWithOrder,
} from '@/types/api'

/**
 * Admin return actions — all scoped by returnNumber, never by orderId.
 *
 * The deprecated /admin/orders/{orderId}/return/* shims are intentionally not
 * referenced here: they cannot express "approve Brand A's return but not
 * Brand B's" on a multi-brand order.
 *
 *   POST /admin/returns/{n}/approve           REQUESTED → APPROVED
 *   POST /admin/returns/{n}/receive           APPROVED → RECEIVED (fallback when the brand doesn't confirm)
 *   GET  /admin/returns/{n}/refund-preview    exactly what release will send (read-only)
 *   POST /admin/returns/{n}/release-refund    sends the backend-computed refund; never an amount from here
 *   POST /admin/returns/{n}/reconcile-refund  RECORD | RELEASE (stuck > 5 min) | REFRESH (pending)
 *
 * Each mutation returns the updated OrderResponseDto. A released refund is not REFUNDED until
 * Mollie confirms it (refundState PENDING meanwhile). Nothing here retries.
 */

interface Page<T> { content: T[] }
function unpage<T>(res: Page<T> | T[]): T[] {
  return Array.isArray(res) ? res : (res.content ?? [])
}

const ret = (returnNumber: string, action: string) =>
  `/admin/returns/${encodeURIComponent(returnNumber)}/${action}`

export const adminReturnsApi = {
  /** Every return across all orders, flattened — one row per brand return. */
  async getAdminReturns(): Promise<ReturnWithOrder[]> {
    const orders = unpage(await fetcher<Page<ApiOrder> | ApiOrder[]>('/admin/orders?page=0&size=200'))
    return flattenReturns(orders)
  },

  /** REQUESTED → APPROVED. No body. */
  async approveReturn(returnNumber: string): Promise<ApiOrder> {
    return fetcher<ApiOrder>(ret(returnNumber, 'approve'), { method: 'POST' })
  },

  /** APPROVED → RECEIVED. No body. Restores stock for this return's units only. */
  async receiveReturn(returnNumber: string): Promise<ApiOrder> {
    return fetcher<ApiOrder>(ret(returnNumber, 'receive'), { method: 'POST' })
  },

  async getRefundPreview(returnNumber: string): Promise<RefundPreview> {
    return fetcher<RefundPreview>(ret(returnNumber, 'refund-preview'))
  },

  async getOrderRefundPreview(orderId: string | number): Promise<OrderRefundPreview> {
    return fetcher<OrderRefundPreview>(`/admin/orders/${orderId}/refund-preview`)
  },

  async listRefunds(state: RefundDashboardState, page = 0, size = 20): Promise<ApiPage<RefundOverviewRow>> {
    return fetcher<ApiPage<RefundOverviewRow>>(`/admin/refunds?state=${state}&page=${page}&size=${size}`)
  },

  /**
   * Releases (or, on a FAILED refund, resends) the backend-computed refund. An APPROVED return
   * (goods not confirmed) needs an override reason. Synchronous: callers disable the button
   * while in flight and never retry automatically.
   */
  async releaseRefund(returnNumber: string, overrideReason?: string): Promise<ApiOrder> {
    const reason = overrideReason?.trim()
    return fetcher<ApiOrder>(ret(returnNumber, 'release-refund'), {
      method: 'POST',
      body: JSON.stringify(reason ? { overrideReason: reason } : {}),
    })
  },

  async reconcileRefund(returnNumber: string, action: ReconcileRefundAction, refundId?: string): Promise<ApiOrder> {
    const id = refundId?.trim()
    return fetcher<ApiOrder>(ret(returnNumber, 'reconcile-refund'), {
      method: 'POST',
      body: JSON.stringify(action === 'RECORD' && id ? { action, refundId: id } : { action }),
    })
  },
}

const RATE_LIMITED = 'Mollie ist gerade ausgelastet. Bitte in einer Minute erneut versuchen.'

/**
 * Maps a FetchError onto an admin-facing message.
 * The backend error body is {timestamp, status, error, message}; fetcher already
 * surfaces `message`. Nothing here retries — state conflicts must not be retried.
 */
export function returnActionErrorMessage(status: number, backendMessage: string): string {
  switch (status) {
    case 400: return backendMessage || 'Ungültige Anfrage.'
    case 404: return 'Retoure nicht gefunden.'
    case 409: return backendMessage || 'Status-Konflikt — die Retoure wurde vermutlich bereits bearbeitet.'
    case 503: return RATE_LIMITED
    case 500: return 'Serverfehler. Bitte später erneut versuchen.'
    default:  return backendMessage || 'Aktion fehlgeschlagen.'
  }
}

/** Release / resend. 409 covers "already released" as well as "outcome unknown" (Mollie timeout). */
export function releaseRefundErrorMessage(status: number, backendMessage: string): string {
  switch (status) {
    case 400: return `Mollie hat die Erstattung abgelehnt. Es wurde nichts erstattet — ein erneuter Versuch ist sicher.${backendMessage ? ` (${backendMessage})` : ''}`
    case 409: return `Erstattung nicht möglich: ${backendMessage || 'Status-Konflikt'}. Bei unklarem Ergebnis zuerst in Mollie prüfen und nach 5 Minuten abgleichen.`
    case 503: return RATE_LIMITED
    default:  return returnActionErrorMessage(status, backendMessage)
  }
}

export function reconcileRefundErrorMessage(status: number, backendMessage: string): string {
  switch (status) {
    case 400: return 'Für „Erfassen" wird die Mollie-Erstattungs-ID (re_…) benötigt.'
    case 409: return `Abgleich nicht möglich: ${backendMessage || 'noch nicht hängend, nicht ausstehend oder ID passt nicht'}.`
    case 503: return RATE_LIMITED
    default:  return returnActionErrorMessage(status, backendMessage)
  }
}

/** RECORD / RELEASE are only safe for a release stuck 5+ minutes — earlier would race Mollie's answer. */
export function canReconcileRefund(
  row: Pick<RefundOverviewRow, 'state' | 'claimedAt'>,
  now: number = Date.now(),
): boolean {
  if (row.state !== 'IN_PROGRESS' || !row.claimedAt) return false
  return now - new Date(row.claimedAt).getTime() >= RECONCILE_ELIGIBLE_AFTER_MS
}
