// Owns "what happens when an admin cancels or reconciles order items" end to end: the fetch,
// the German error copy, and — the one rule both call sites must apply identically — that a
// 409 can mean the order changed under us (refund outcome unknown, or a claim someone else
// already settled), so the caller always gets a best-effort refreshed order alongside the
// failure instead of re-deriving that refetch itself.
import { adminApi, FetchError } from '@/lib/api'
import { cancelItemsErrorMessage, reconcileCancelErrorMessage } from '@/lib/api/errorCopy'
import type { ApiOrder, CancelReason } from '@/types/api'

export type CancelItemsOutcome =
  | { ok: true; order: ApiOrder }
  | { ok: false; message: string; refreshedOrder?: ApiOrder }

export type ReconcileOutcome =
  | { ok: true; order: ApiOrder }
  | { ok: false; message: string; refreshedOrder?: ApiOrder }

async function bestEffortRefetch(orderId: string): Promise<ApiOrder | undefined> {
  try {
    return await adminApi.orders.getById(orderId)
  } catch {
    return undefined
  }
}

export async function cancelOrderItems(
  orderId: string,
  itemIds: (string | number)[],
  reason: CancelReason,
  note?: string,
): Promise<CancelItemsOutcome> {
  try {
    const order = await adminApi.orders.cancelItems(orderId, itemIds, reason, note)
    return { ok: true, order }
  } catch (e: unknown) {
    const status = e instanceof FetchError ? e.status : 0
    const message = cancelItemsErrorMessage(status, e instanceof Error ? e.message : 'Stornierung fehlgeschlagen.')
    const refreshedOrder = status === 409 ? await bestEffortRefetch(orderId) : undefined
    return { ok: false, message, refreshedOrder }
  }
}

export async function reconcileCancelledItem(
  orderId: string,
  claimKey: string,
  action: 'RECORD' | 'RELEASE',
  refundId?: string,
): Promise<ReconcileOutcome> {
  try {
    const order = await adminApi.orders.reconcileCancelItems(orderId, claimKey, action, refundId)
    return { ok: true, order }
  } catch (e: unknown) {
    const status = e instanceof FetchError ? e.status : 0
    const message = reconcileCancelErrorMessage(status, e instanceof Error ? e.message : 'Klärung fehlgeschlagen.')
    const refreshedOrder = status === 409 ? await bestEffortRefetch(orderId) : undefined
    return { ok: false, message, refreshedOrder }
  }
}
