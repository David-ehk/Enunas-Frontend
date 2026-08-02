import { fetcher } from '../fetcher'
import { flattenReturns } from './returnsApi'
import type { ApiOrder, ReturnWithOrder } from '@/types/api'

/**
 * Admin return actions — all scoped by returnNumber, never by orderId.
 *
 * The deprecated /admin/orders/{orderId}/return/* shims are intentionally not
 * referenced here: they cannot express "approve Brand A's return but not
 * Brand B's" on a multi-brand order.
 *
 * Verified endpoints:
 *   POST /admin/returns/{returnNumber}/approve   requires status REQUESTED
 *   POST /admin/returns/{returnNumber}/receive   requires status APPROVED, restores stock
 *   POST /admin/returns/{returnNumber}/refund    requires status RECEIVED, refundAmount optional
 *
 * Each returns the updated OrderResponseDto.
 */

interface Page<T> { content: T[] }
function unpage<T>(res: Page<T> | T[]): T[] {
  return Array.isArray(res) ? res : (res.content ?? [])
}

export const adminReturnsApi = {
  /** Every return across all orders, flattened — one row per brand return. */
  async getAdminReturns(): Promise<ReturnWithOrder[]> {
    const orders = unpage(await fetcher<Page<ApiOrder> | ApiOrder[]>('/admin/orders?page=0&size=200'))
    return flattenReturns(orders)
  },

  /** REQUESTED → APPROVED. No body. */
  async approveReturn(returnNumber: string): Promise<ApiOrder> {
    return fetcher<ApiOrder>(`/admin/returns/${encodeURIComponent(returnNumber)}/approve`, { method: 'POST' })
  },

  /** APPROVED → RECEIVED. No body. Restores stock for this return's items only. */
  async receiveReturn(returnNumber: string): Promise<ApiOrder> {
    return fetcher<ApiOrder>(`/admin/returns/${encodeURIComponent(returnNumber)}/receive`, { method: 'POST' })
  },

  /**
   * RECEIVED → REFUNDED.
   *
   * refundAmount is optional; omitting it refunds the full remaining refundable
   * amount for THIS BRAND only. Never pass a figure derived from order.total or
   * from another brand's return.
   */
  async refundReturn(returnNumber: string, refundAmount?: number): Promise<ApiOrder> {
    const qs = refundAmount != null ? `?refundAmount=${encodeURIComponent(String(refundAmount))}` : ''
    return fetcher<ApiOrder>(`/admin/returns/${encodeURIComponent(returnNumber)}/refund${qs}`, { method: 'POST' })
  },
}

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
    case 500: return 'Serverfehler. Bitte später erneut versuchen.'
    default:  return backendMessage || 'Aktion fehlgeschlagen.'
  }
}
