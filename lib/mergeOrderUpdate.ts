// Some order-mutation endpoints (status change, whole-order cancel, per-item cancel, return
// request, ship confirmation, …) answer with a trimmed OrderResponseDto that drops shipments[]
// and items[] — a blind `{ ...current, ...patch }` then wipes the tracking column and the item
// list in the UI. Every call site that applies a partial ApiOrder response should merge through
// this instead of replacing outright.
import type { ApiOrder } from '@/types/api';

export function mergeOrderUpdate(current: ApiOrder, patch: Partial<ApiOrder>): ApiOrder {
  return {
    ...current,
    ...patch,
    shipments: patch.shipments?.length ? patch.shipments : current.shipments,
    items: patch.items?.length ? patch.items : current.items,
  };
}
