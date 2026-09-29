// Central rules for the per-item cancellation state on an order item — every consumer (admin
// order detail, vendor fulfilment gating, customer return picker) reads these instead of
// re-deriving "is this item still returnable / shippable / cancellable" independently.
import type { ApiOrderItem } from '@/types/api';

const RECONCILE_ELIGIBLE_AFTER_MS = 5 * 60 * 1000;

/** Absence of cancellationState means the item predates this feature — treat it as ACTIVE. */
export function isItemActive(item: Pick<ApiOrderItem, 'cancellationState'>): boolean {
  return !item.cancellationState || item.cancellationState === 'ACTIVE';
}

export function hasNonActiveItems(items: ApiOrderItem[] | undefined): boolean {
  return (items ?? []).some((i) => !isItemActive(i));
}

/** True only once every item on the (brand-scoped) list has actually been cancelled. */
export function allItemsCancelled(items: ApiOrderItem[] | undefined): boolean {
  const list = items ?? [];
  return list.length > 0 && list.every((i) => i.cancellationState === 'CANCELLED');
}

/**
 * A stuck PENDING claim becomes reconcilable once it is 5+ minutes old — before that the
 * refund may still be in flight, and reconciling early would race a Mollie callback that is
 * still on its way.
 */
export function canReconcileItem(
  item: Pick<ApiOrderItem, 'cancellationState' | 'cancelledAt'>,
  now: number = Date.now(),
): boolean {
  if (item.cancellationState !== 'PENDING' || !item.cancelledAt) return false;
  return now - new Date(item.cancelledAt).getTime() >= RECONCILE_ELIGIBLE_AFTER_MS;
}
