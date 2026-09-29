# Per-Item Order Cancellation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin cancel one brand's still-unshipped line items on a paid multi-brand order (refund + stock restore for exactly those items), reflect the new per-item cancellation state everywhere it changes behaviour (admin order detail, vendor fulfilment, customer return picker), and provide the admin reconciliation flow for a stuck refund claim.

**Architecture:** Two new admin-only endpoints (`POST /admin/orders/{id}/cancel-items` and `.../cancel-items/reconcile`) are wrapped in `adminApi.orders`. A new pure module `lib/orderItemCancellation.ts` centralises the per-item state logic (active/pending/cancelled, reconcile-eligibility, "brand fully cancelled") so every consumer (admin UI, vendor fulfilment gating, customer return picker) reads the same rules instead of re-deriving them. Admin `Orders.tsx` gets per-item checkboxes, a cancel-items modal, cancellation badges, and a reconcile modal; `brandRevenue.ts`'s `brandCanShip` gate and `Fulfillment.tsx`'s item badges pick up the same module; `Bestellungen.tsx`'s return-item picker excludes non-active items.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Vitest, pnpm. No new dependencies.

**Spec:** The backend hand-off pasted into this session on 2026-09-29 ("Frontend handoff — per-item cancellation"), reproduced task-by-task below. No separate design doc file exists in this repo; this plan **is** the spec's frontend translation.

## Global Constraints

- Test first: write the failing test, run it, confirm the failure reason, then write the minimum implementation, per `CLAUDE.md`'s "Testing: test first, only what is necessary" section.
- Never edit a test and the code it guards in the same step.
- Only modify what is explicitly listed in this plan — no drive-by refactors, no comments/docstrings on untouched code.
- Run `pnpm run build` after every task that touches `.ts`/`.tsx` files; do not report a task done until it passes.
- All endpoints are admin-only, same auth as the existing whole-order cancel (`fetcher` with default `auth: true`).
- `reason` is `CancelReason` (already defined in `types/api.ts`); `note` is optional, max 500 chars, no HTML.
- Brand-scoped order views (what `/brand/orders` returns) never carry `refundTransactionId` or `cancellationClaimKey` on an item — treat both as always possibly-undefined, never assume presence.
- An item with no `cancellationState` at all predates this feature — treat it as `ACTIVE`, never as an error case.

## Review Focus

- **A PENDING item younger than 5 minutes must not offer "Klären…" (reconcile).** The claim may still be in flight; reconciling early races a Mollie callback that is still on its way. Test: `canReconcileItem` at 4m59s vs 5m00s vs 5m01s old.
- **A brand whose items are only *partially* cancelled must still be able to ship the rest.** Only *full* cancellation of a brand's items on an order should hide "Versenden"/"Problem melden". Test: `brandCanShip` with one cancelled + one active item stays `true`.
- **The whole-order "Stornieren" button must disappear the instant any item is PENDING or CANCELLED**, even while the order's own `status` is still PAID/PARTIALLY_SHIPPED (the backend now 409s that endpoint in this state). Test: `hasNonActiveItems` plus the button-gating condition in Orders.tsx.
- **A 409 on cancel-items must not silently lose information** — per the backend hand-off's own UI suggestion #4, the admin must see the order refreshed (so a newly-PENDING item becomes visible) *and* the backend's message, not just a generic toast.
- **The customer return picker must never let someone select an already-cancelled or in-flight-cancellation item** — a return on a refunded line item would double-refund. Test: the picker's item list is built from `isItemActive`, not from `order.items` directly.

---

### Task 1: Types + `orderItemCancellation` pure module

**Files:**
- Modify: `types/api.ts` (add `CancellationState`, extend `ApiOrderItem`)
- Create: `lib/orderItemCancellation.ts`
- Test: `lib/orderItemCancellation.test.ts`

**Interfaces:**
- Produces: `CancellationState = 'ACTIVE' | 'PENDING' | 'CANCELLED'` (in `types/api.ts`)
- Produces: `ApiOrderItem.cancellationState?: CancellationState`, `.cancelledAt?: string | null`, `.cancellationReason?: CancelReason | null`, `.refundTransactionId?: string | null`, `.cancellationClaimKey?: string | null`
- Produces (from `lib/orderItemCancellation.ts`): `isItemActive(item): boolean`, `hasNonActiveItems(items?): boolean`, `allItemsCancelled(items?): boolean`, `canReconcileItem(item, now?): boolean`
- Consumed by: Task 3 (`brandRevenue.ts`), Task 4 (admin `Orders.tsx`), Task 6 (`Fulfillment.tsx`), Task 7 (`Bestellungen.tsx`)

- [ ] **Step 1: Write the failing test**

Create `lib/orderItemCancellation.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { isItemActive, hasNonActiveItems, allItemsCancelled, canReconcileItem } from './orderItemCancellation';
import type { ApiOrderItem } from '@/types/api';

function item(overrides: Partial<ApiOrderItem> = {}): ApiOrderItem {
  return { id: '1', quantity: 1, ...overrides };
}

describe('isItemActive', () => {
  it('treats an item with no cancellationState as active (predates the feature)', () => {
    expect(isItemActive(item())).toBe(true);
  });
  it('treats ACTIVE as active', () => {
    expect(isItemActive(item({ cancellationState: 'ACTIVE' }))).toBe(true);
  });
  it('treats PENDING and CANCELLED as not active', () => {
    expect(isItemActive(item({ cancellationState: 'PENDING' }))).toBe(false);
    expect(isItemActive(item({ cancellationState: 'CANCELLED' }))).toBe(false);
  });
});

describe('hasNonActiveItems', () => {
  it('is false when every item is active', () => {
    expect(hasNonActiveItems([item(), item({ cancellationState: 'ACTIVE' })])).toBe(false);
  });
  it('is true when any item is PENDING or CANCELLED', () => {
    expect(hasNonActiveItems([item(), item({ cancellationState: 'CANCELLED' })])).toBe(true);
  });
  it('is false for an empty or undefined list', () => {
    expect(hasNonActiveItems(undefined)).toBe(false);
    expect(hasNonActiveItems([])).toBe(false);
  });
});

describe('allItemsCancelled', () => {
  it('is true only when every item is CANCELLED', () => {
    expect(allItemsCancelled([
      item({ cancellationState: 'CANCELLED' }),
      item({ cancellationState: 'CANCELLED' }),
    ])).toBe(true);
  });
  it('is false when at least one item is active or pending', () => {
    expect(allItemsCancelled([item({ cancellationState: 'CANCELLED' }), item()])).toBe(false);
  });
  it('is false for an empty order', () => {
    expect(allItemsCancelled([])).toBe(false);
  });
});

describe('canReconcileItem', () => {
  const now = new Date('2026-09-29T12:00:00Z').getTime();

  it('is false when the item is not PENDING', () => {
    expect(canReconcileItem(item({ cancellationState: 'ACTIVE' }), now)).toBe(false);
    expect(canReconcileItem(item({ cancellationState: 'CANCELLED', cancelledAt: new Date(now).toISOString() }), now)).toBe(false);
  });
  it('is false when PENDING but claimed less than 5 minutes ago', () => {
    const cancelledAt = new Date(now - 4 * 60 * 1000).toISOString();
    expect(canReconcileItem(item({ cancellationState: 'PENDING', cancelledAt }), now)).toBe(false);
  });
  it('is true when PENDING and claimed exactly 5 minutes ago', () => {
    const cancelledAt = new Date(now - 5 * 60 * 1000).toISOString();
    expect(canReconcileItem(item({ cancellationState: 'PENDING', cancelledAt }), now)).toBe(true);
  });
  it('is false when PENDING but has no cancelledAt timestamp', () => {
    expect(canReconcileItem(item({ cancellationState: 'PENDING' }), now)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm run test:run lib/orderItemCancellation.test.ts`
Expected: FAIL — `Cannot find module './orderItemCancellation'` (the module doesn't exist yet).

- [ ] **Step 3: Extend the types**

In `types/api.ts`, add right after the existing `CancelReason` export (line 16):

```ts
// Per-item cancellation state for the admin per-item cancel feature.
export type CancellationState = 'ACTIVE' | 'PENDING' | 'CANCELLED';
```

In the `ApiOrderItem` interface, add after the existing `imageUrl` field (after line 256, before the "Legacy fields" comment):

```ts
  // Per-item cancellation state (admin per-item cancel). Absent/undefined on orders predating
  // this feature and on brand-scoped views for the two fields marked below — treat as ACTIVE.
  cancellationState?: CancellationState;
  // Set from the moment the item is claimed for cancellation (state PENDING or CANCELLED).
  cancelledAt?: string | null;
  cancellationReason?: CancelReason | null;
  // Mollie refund id once CANCELLED. Never present on brand-scoped order views.
  refundTransactionId?: string | null;
  // Needed to reconcile a stuck PENDING claim. Never present on brand-scoped order views.
  cancellationClaimKey?: string | null;
```

- [ ] **Step 4: Write the minimal implementation**

Create `lib/orderItemCancellation.ts`:

```ts
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm run test:run lib/orderItemCancellation.test.ts`
Expected: PASS (13 tests).

- [ ] **Step 6: Run the build**

Run: `pnpm run build`
Expected: PASS — no type errors from the `types/api.ts` change.

- [ ] **Step 7: Commit**

```bash
git add types/api.ts lib/orderItemCancellation.ts lib/orderItemCancellation.test.ts
git commit -m "feat(orders): add per-item cancellation types and pure state helpers"
```

---

### Task 2: `adminApi.orders.cancelItems` / `.getById` / `.reconcileCancelItems`

**Files:**
- Modify: `lib/api/modules/adminApi.ts:110-134` (the `orders` block)
- Test: `lib/api/modules/adminApi.test.ts` (new file)

**Interfaces:**
- Consumes: `CancelReason` (from `types/api.ts`, already imported in this file)
- Produces: `adminApi.orders.getById(orderId: string): Promise<ApiOrder>`, `adminApi.orders.cancelItems(orderId: string, orderItemIds: (string | number)[], reason: CancelReason, note?: string): Promise<ApiOrder>`, `adminApi.orders.reconcileCancelItems(orderId: string, claimKey: string, action: 'RECORD' | 'RELEASE', refundId?: string): Promise<ApiOrder>`
- Consumed by: Task 4 (admin `Orders.tsx`)

- [ ] **Step 1: Write the failing test**

Create `lib/api/modules/adminApi.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { adminApi } from './adminApi'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const order = { id: '1', status: 'PAID', currency: 'EUR', items: [], createdAt: 'x' }

beforeEach(() => { vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test') })
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

describe('adminApi.orders.getById', () => {
  it('fetches a single order by id', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(order))
    vi.stubGlobal('fetch', spy)
    await adminApi.orders.getById('1')
    expect(spy.mock.calls[0][0]).toBe('https://api.test/admin/orders/1')
  })
})

describe('adminApi.orders.cancelItems', () => {
  it('posts orderItemIds, reason and note to /admin/orders/{id}/cancel-items', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(order))
    vi.stubGlobal('fetch', spy)
    await adminApi.orders.cancelItems('1', [41, 42], 'OUT_OF_STOCK', 'restocking issue')
    expect(spy.mock.calls[0][0]).toBe('https://api.test/admin/orders/1/cancel-items')
    const init = spy.mock.calls[0][1] as RequestInit
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ orderItemIds: [41, 42], reason: 'OUT_OF_STOCK', note: 'restocking issue' })
  })

  it('omits note when not given', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(order))
    vi.stubGlobal('fetch', spy)
    await adminApi.orders.cancelItems('1', [41], 'OTHER')
    const init = spy.mock.calls[0][1] as RequestInit
    expect(JSON.parse(init.body as string)).toEqual({ orderItemIds: [41], reason: 'OTHER' })
  })
})

describe('adminApi.orders.reconcileCancelItems', () => {
  it('posts claimKey, action and refundId for RECORD', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(order))
    vi.stubGlobal('fetch', spy)
    await adminApi.orders.reconcileCancelItems('1', 'item-cancel-ENS-2026-ABC123-uuid', 'RECORD', 're_abc')
    expect(spy.mock.calls[0][0]).toBe('https://api.test/admin/orders/1/cancel-items/reconcile')
    const init = spy.mock.calls[0][1] as RequestInit
    expect(JSON.parse(init.body as string)).toEqual({ claimKey: 'item-cancel-ENS-2026-ABC123-uuid', action: 'RECORD', refundId: 're_abc' })
  })

  it('omits refundId for RELEASE', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(order))
    vi.stubGlobal('fetch', spy)
    await adminApi.orders.reconcileCancelItems('1', 'item-cancel-ENS-2026-ABC123-uuid', 'RELEASE')
    const init = spy.mock.calls[0][1] as RequestInit
    expect(JSON.parse(init.body as string)).toEqual({ claimKey: 'item-cancel-ENS-2026-ABC123-uuid', action: 'RELEASE' })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm run test:run lib/api/modules/adminApi.test.ts`
Expected: FAIL — `adminApi.orders.getById is not a function` (and the other two methods).

- [ ] **Step 3: Write the minimal implementation**

In `lib/api/modules/adminApi.ts`, inside the `orders` object (after the existing `cancel` method, before its closing comment at line 133), add:

```ts
    async getById(orderId: string): Promise<ApiOrder> {
      return fetcher<ApiOrder>(`/admin/orders/${orderId}`);
    },
    // Backend CancelItemsDto: { orderItemIds, reason, note? }. Items must belong to one brand
    // and one order — the backend enforces this and answers 400 if they don't.
    async cancelItems(
      orderId: string,
      orderItemIds: (string | number)[],
      reason: CancelReason,
      note?: string,
    ): Promise<ApiOrder> {
      return fetcher<ApiOrder>(`/admin/orders/${orderId}/cancel-items`, {
        method: 'POST',
        body: JSON.stringify({ orderItemIds, reason, ...(note ? { note } : {}) }),
      });
    },
    // Only for a claim 5+ minutes old whose refund outcome is unknown (Mollie timeout/5xx).
    // RECORD requires refundId (verified in Mollie by the admin first); RELEASE does not.
    async reconcileCancelItems(
      orderId: string,
      claimKey: string,
      action: 'RECORD' | 'RELEASE',
      refundId?: string,
    ): Promise<ApiOrder> {
      return fetcher<ApiOrder>(`/admin/orders/${orderId}/cancel-items/reconcile`, {
        method: 'POST',
        body: JSON.stringify({ claimKey, action, ...(refundId ? { refundId } : {}) }),
      });
    },
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm run test:run lib/api/modules/adminApi.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Run the build**

Run: `pnpm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/api/modules/adminApi.ts lib/api/modules/adminApi.test.ts
git commit -m "feat(orders): add adminApi.orders.cancelItems/reconcileCancelItems/getById"
```

---

### Task 3: Error copy for the two new endpoints

**Files:**
- Modify: `lib/api/errorCopy.ts` (add two functions after the existing `cancelOrderErrorMessage`)
- Test: `lib/api/cancelItemsErrorMessage.test.ts` (new file, mirrors the existing `cancelOrderErrorMessage.test.ts`)

**Interfaces:**
- Produces: `cancelItemsErrorMessage(status: number, serverMessage: string): string`, `reconcileCancelErrorMessage(status: number, serverMessage: string): string`
- Consumed by: Task 4 (admin `Orders.tsx`)

- [ ] **Step 1: Write the failing test**

Create `lib/api/cancelItemsErrorMessage.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { cancelItemsErrorMessage, reconcileCancelErrorMessage } from './errorCopy';

describe('cancelItemsErrorMessage', () => {
  it('passes the backend message through for 400 (nothing was cancelled)', () => {
    expect(cancelItemsErrorMessage(400, 'Items belong to different brands'))
      .toBe('Items belong to different brands');
  });
  it('falls back to a German message for an empty 400 body', () => {
    expect(cancelItemsErrorMessage(400, ''))
      .toBe('Ungültige Anfrage — die Artikel wurden NICHT storniert.');
  });
  it('passes the backend message through for 409', () => {
    expect(cancelItemsErrorMessage(409, 'Brand has already shipped these items'))
      .toBe('Brand has already shipped these items');
  });
  it('falls back to a German message for an empty 409 body', () => {
    expect(cancelItemsErrorMessage(409, ''))
      .toBe('Status-Konflikt — bitte Bestellung neu laden.');
  });
  it('falls back to a generic message for any other status', () => {
    expect(cancelItemsErrorMessage(500, '')).toBe('Stornierung der Artikel fehlgeschlagen.');
  });
});

describe('reconcileCancelErrorMessage', () => {
  it('passes the backend message through for 409', () => {
    expect(reconcileCancelErrorMessage(409, 'Claim is still in progress'))
      .toBe('Claim is still in progress');
  });
  it('falls back to a German message for an empty 409 body', () => {
    expect(reconcileCancelErrorMessage(409, ''))
      .toBe('Die Klärung ist noch nicht möglich — bitte erneut versuchen.');
  });
  it('falls back to a generic message for any other status', () => {
    expect(reconcileCancelErrorMessage(500, '')).toBe('Aktion fehlgeschlagen.');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm run test:run lib/api/cancelItemsErrorMessage.test.ts`
Expected: FAIL — `cancelItemsErrorMessage is not a function` (and the second one).

- [ ] **Step 3: Write the minimal implementation**

In `lib/api/errorCopy.ts`, after the existing `cancelOrderErrorMessage` function (end of file), add:

```ts

// Domain-specific error messages for POST /admin/orders/{id}/cancel-items.
export function cancelItemsErrorMessage(status: number, serverMessage: string): string {
  switch (status) {
    // Unknown item / item of another order / mixed brands / invalid body, OR Mollie
    // definitively rejected the refund — either way nothing was cancelled, retry is safe.
    case 400: return serverMessage || 'Ungültige Anfrage — die Artikel wurden NICHT storniert.';
    // Order not cancellable/not paid, item has no recorded paid amount, brand already shipped,
    // item already cancelled/being cancelled, OR the refund outcome is unknown and the items
    // are now PENDING — the caller reloads the order so a PENDING item becomes visible.
    case 409: return serverMessage || 'Status-Konflikt — bitte Bestellung neu laden.';
    default: return serverMessage || 'Stornierung der Artikel fehlgeschlagen.';
  }
}

// Domain-specific error messages for POST /admin/orders/{id}/cancel-items/reconcile.
export function reconcileCancelErrorMessage(status: number, serverMessage: string): string {
  switch (status) {
    // Claim under 5 minutes old, already settled, claim key not on this order, missing
    // refundId for RECORD, or the refundId is already used by another refund.
    case 409: return serverMessage || 'Die Klärung ist noch nicht möglich — bitte erneut versuchen.';
    default: return serverMessage || 'Aktion fehlgeschlagen.';
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm run test:run lib/api/cancelItemsErrorMessage.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Run the build**

Run: `pnpm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/api/errorCopy.ts lib/api/cancelItemsErrorMessage.test.ts
git commit -m "feat(orders): add German error copy for cancel-items and reconcile"
```

---

### Task 4: `brandCanShip` — hide shipping/problem actions once a brand's items are fully cancelled

**Files:**
- Modify: `lib/brandRevenue.ts:149-153` (`brandCanShip`)
- Test: `lib/brandRevenue.test.ts` (append to the existing `describe('brandCanShip — the "Versenden" gate', …)` block)

**Interfaces:**
- Consumes: `allItemsCancelled` from `./orderItemCancellation` (Task 1)
- Produces: `brandCanShip` unchanged signature, new behaviour
- Consumed by: Task 6 (`Fulfillment.tsx`, already calls `brandCanShip` — no call-site change needed)

- [ ] **Step 1: Write the failing test**

In `lib/brandRevenue.test.ts`, inside the existing `describe('brandCanShip — the "Versenden" gate', () => { … })` block, add (right before the closing `})` of that describe, i.e. after the "falls back to the order status for legacy orders" test):

```ts

  it("never offers shipping once every one of this brand's items has been cancelled", () => {
    const o = order({
      status: 'PAID', returns: [], shipments: [awaiting],
      items: [
        { id: '5', quantity: 1, productName: 'E2E Alpha Hoodie', variantSku: 'QXGXMUSV', priceAtPurchase: 89.95, lineTotal: 89.95, cancellationState: 'CANCELLED' },
      ],
    } as unknown as Partial<ApiOrder>)
    expect(brandCanShip(o, 5)).toBe(false)
  })

  it("still offers shipping when only some of the brand's items were cancelled", () => {
    const o = order({
      status: 'PAID', returns: [], shipments: [awaiting],
      items: [
        { id: '5', quantity: 1, variantSku: 'QXGXMUSV', priceAtPurchase: 89.95, lineTotal: 89.95, cancellationState: 'CANCELLED' },
        { id: '6', quantity: 1, variantSku: 'GVNKCH8T', priceAtPurchase: 29.95, lineTotal: 29.95 },
      ],
    } as unknown as Partial<ApiOrder>)
    expect(brandCanShip(o, 5)).toBe(true)
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm run test:run lib/brandRevenue.test.ts`
Expected: FAIL on the first new test (`expected true to be false`) — `brandCanShip` does not yet look at item cancellation state.

- [ ] **Step 3: Write the minimal implementation**

In `lib/brandRevenue.ts`, add the import (near the top, with the other local imports — there are none currently besides the `types/api` import, so add a new line right after it):

```ts
import { allItemsCancelled } from './orderItemCancellation'
```

Then change `brandCanShip` (currently):

```ts
export function brandCanShip(order: ApiOrder, brandId: string | number | null): boolean {
  if (brandOrderStatus(order, brandId) !== 'PAID') return false
  const mine = ownShipment(order, brandId)
  return mine ? mine.status === 'AWAITING_SHIPMENT' : true
}
```

to:

```ts
export function brandCanShip(order: ApiOrder, brandId: string | number | null): boolean {
  if (brandOrderStatus(order, brandId) !== 'PAID') return false
  if (allItemsCancelled(order.items)) return false
  const mine = ownShipment(order, brandId)
  return mine ? mine.status === 'AWAITING_SHIPMENT' : true
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm run test:run lib/brandRevenue.test.ts`
Expected: PASS (all tests in the file, including the two new ones).

- [ ] **Step 5: Run the build**

Run: `pnpm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/brandRevenue.ts lib/brandRevenue.test.ts
git commit -m "fix(vendor): hide shipping actions once a brand's items are fully cancelled"
```

---

### Task 5: Admin `Orders.tsx` — per-item selection, cancel-items modal, cancellation badges

**Files:**
- Modify: `app/(dashboard)/dashboard/admin/_components/Orders.tsx`

No test file — this task is UI composition over the already-tested pure functions and API calls from Tasks 1–3. Per `CLAUDE.md`, component tests are not written here (no existing component-test infrastructure in this project — same reasoning as every other admin dashboard screen).

**Interfaces:**
- Consumes: `isItemActive`, `hasNonActiveItems` (Task 1), `adminApi.orders.cancelItems`, `adminApi.orders.getById` (Task 2), `cancelItemsErrorMessage` (Task 3), `FetchError` (from `@/lib/api`)

- [ ] **Step 1: Add imports**

At the top of `Orders.tsx`, change:

```tsx
import type { ApiOrder, AdminCustomer, CancelReason } from '@/types/api'
import { PageHeader, SectionCard, StatusBadge, EmptyState, Loader, SearchInput, SelectFilter, TH, TD, TableRow, fmt, fmtEur } from './shared'
import { ChevronDown, ChevronUp, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import OrderItemThumb from '@/components/ui/OrderItemThumb'
import { canCancelOrder } from '@/lib/canCancelOrder'
import { cancelOrderErrorMessage } from '@/lib/api/errorCopy'
```

to:

```tsx
import type { ApiOrder, ApiOrderItem, AdminCustomer, CancelReason } from '@/types/api'
import { PageHeader, SectionCard, StatusBadge, EmptyState, Loader, SearchInput, SelectFilter, TH, TD, TableRow, fmt, fmtEur } from './shared'
import { ChevronDown, ChevronUp, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import OrderItemThumb from '@/components/ui/OrderItemThumb'
import { canCancelOrder } from '@/lib/canCancelOrder'
import { isItemActive, hasNonActiveItems, canReconcileItem } from '@/lib/orderItemCancellation'
import { cancelOrderErrorMessage, cancelItemsErrorMessage, reconcileCancelErrorMessage } from '@/lib/api/errorCopy'
import { FetchError } from '@/lib/api'
```

- [ ] **Step 2: Add per-order selection + modal state**

In the `Orders` component, change:

```tsx
  const [cancelOrderData, setCancelOrderData] = useState<{ order: ApiOrder; showDialog: boolean } | null>(null)
```

to:

```tsx
  const [cancelOrderData, setCancelOrderData] = useState<{ order: ApiOrder; showDialog: boolean } | null>(null)
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [itemCancelTarget, setItemCancelTarget] = useState<ApiOrder | null>(null)
  const [reconcileTarget, setReconcileTarget] = useState<{ order: ApiOrder; item: ApiOrderItem } | null>(null)
```

- [ ] **Step 3: Reset selection when the expanded row changes**

Change the expand toggle button's `onClick`:

```tsx
                      <button
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                        className="p-1.5 rounded-lg hover:bg-[#F5F5F0] text-[#9B9B9B] hover:text-[#6B6B6B] transition-all duration-200"
                      >
```

to:

```tsx
                      <button
                        onClick={() => { setExpanded(expanded === order.id ? null : order.id); setSelectedItemIds([]) }}
                        className="p-1.5 rounded-lg hover:bg-[#F5F5F0] text-[#9B9B9B] hover:text-[#6B6B6B] transition-all duration-200"
                      >
```

- [ ] **Step 4: Add checkboxes and cancellation badges to the item list**

Change the items-rendering block:

```tsx
                            <div className="space-y-2">
                              {order.items?.map(item => {
                                // Backend OrderItemResponseDto sends productName / variantSize /
                                // variantColor / priceAtPurchase — not the legacy name/size/color/
                                // price, which is why every line used to render "€ 0,00".
                                const label = item.productName ?? item.name ?? '—'
                                const size  = item.variantSize ?? item.size
                                const color = item.variantColor ?? item.color
                                const unit  = item.discountPriceAtPurchase ?? item.priceAtPurchase ?? item.price
                                return (
                                  <div key={item.id} className="flex items-center gap-2.5 text-[12px] text-[#0A0A0A]">
                                    <OrderItemThumb src={item.imageUrl} alt={label} width={30} />
                                    <span>
                                      {label} × {item.quantity}
                                      {size && <span className="text-[#9B9B9B]"> · {size}</span>}
                                      {color && <span className="text-[#9B9B9B]"> · {color}</span>}
                                      {unit != null && <span className="text-[#6B6B6B]"> — {fmtEur(unit)}</span>}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
```

to:

```tsx
                            <div className="space-y-2">
                              {(() => {
                                // Item-level cancel is only offered on a paid-and-not-yet-fully-
                                // shipped order; the backend still enforces the real rule
                                // (per-brand shipped state) and answers 409 otherwise.
                                const orderIsPaidish = order.status === 'PAID' || order.status === 'PARTIALLY_SHIPPED'
                                return order.items?.map(item => {
                                  // Backend OrderItemResponseDto sends productName / variantSize /
                                  // variantColor / priceAtPurchase — not the legacy name/size/color/
                                  // price, which is why every line used to render "€ 0,00".
                                  const label = item.productName ?? item.name ?? '—'
                                  const size  = item.variantSize ?? item.size
                                  const color = item.variantColor ?? item.color
                                  const unit  = item.discountPriceAtPurchase ?? item.priceAtPurchase ?? item.price
                                  const active = isItemActive(item)
                                  const canSelect = active && orderIsPaidish
                                  return (
                                    <div key={item.id} className="flex items-center gap-2.5 text-[12px] text-[#0A0A0A]">
                                      {canSelect && (
                                        <input
                                          type="checkbox"
                                          checked={selectedItemIds.includes(item.id)}
                                          onChange={e => setSelectedItemIds(prev =>
                                            e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id)
                                          )}
                                          className="accent-[#370E4D]"
                                        />
                                      )}
                                      <OrderItemThumb src={item.imageUrl} alt={label} width={30} />
                                      <span className={cn(!active && 'line-through text-[#9B9B9B]')}>
                                        {label} × {item.quantity}
                                        {size && <span className="text-[#9B9B9B]"> · {size}</span>}
                                        {color && <span className="text-[#9B9B9B]"> · {color}</span>}
                                        {unit != null && <span className="text-[#6B6B6B]"> — {fmtEur(unit)}</span>}
                                      </span>
                                      {item.cancellationState === 'CANCELLED' && (
                                        <span className="text-[9.5px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                                          Storniert
                                        </span>
                                      )}
                                      {item.cancellationState === 'PENDING' && (
                                        canReconcileItem(item)
                                          ? (
                                            <button
                                              onClick={() => setReconcileTarget({ order, item })}
                                              className="text-[9.5px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all duration-150"
                                            >
                                              Klären…
                                            </button>
                                          )
                                          : (
                                            <span className="text-[9.5px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                              Storno läuft…
                                            </span>
                                          )
                                      )}
                                    </div>
                                  )
                                })
                              })()}
                              {selectedItemIds.length > 0 && (
                                <button
                                  onClick={() => setItemCancelTarget(order)}
                                  className="inline-flex items-center gap-1 h-7 px-2.5 mt-1 rounded-lg text-[11px] font-medium border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-200"
                                >
                                  <XCircle className="w-3 h-3" /> Ausgewählte Artikel stornieren ({selectedItemIds.length})
                                </button>
                              )}
                            </div>
```

- [ ] **Step 5: Hide the whole-order cancel button once any item is non-active**

Change:

```tsx
                          {canCancelOrder(order.status) && (
                            <ActionBtn variant="danger" onClick={() => openCancelDialog(order)}>
                              <XCircle className="w-3 h-3" /> Stornieren
                            </ActionBtn>
                          )}
```

to:

```tsx
                          {canCancelOrder(order.status) && !hasNonActiveItems(order.items) && (
                            <ActionBtn variant="danger" onClick={() => openCancelDialog(order)}>
                              <XCircle className="w-3 h-3" /> Stornieren
                            </ActionBtn>
                          )}
```

- [ ] **Step 6: Add the `ItemCancelModal` and `ReconcileModal` components**

Immediately after the closing `}` of the existing `CancelModal` function (which ends right before the `return (` of the `Orders` component's own JSX, i.e. right after the line containing `  }` that closes `CancelModal`), add:

```tsx

  function ItemCancelModal({
    order,
    itemIds,
    onClose,
    onSuccess,
    onOrderRefreshed,
  }: {
    order: ApiOrder
    itemIds: string[]
    onClose: () => void
    onSuccess: (updated: ApiOrder) => void
    onOrderRefreshed: (updated: ApiOrder) => void
  }) {
    const [reason, setReason] = useState<CancelReason>('OTHER')
    const [note, setNote] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [err, setErr] = useState<string | null>(null)

    async function submit() {
      setSubmitting(true)
      setErr(null)
      try {
        const updated = await adminApi.orders.cancelItems(order.id, itemIds, reason, note.trim() || undefined)
        onSuccess(updated)
      } catch (e: unknown) {
        const status = e instanceof FetchError ? e.status : 0
        if (status === 409) {
          // Refund outcome may be unknown — the item is now PENDING. Refresh so the admin sees
          // the current state without closing the dialog, per the backend hand-off's own
          // "handle 409 by refreshing the order" guidance.
          try { onOrderRefreshed(await adminApi.orders.getById(order.id)) } catch { /* best-effort refresh */ }
        }
        setErr(cancelItemsErrorMessage(status, e instanceof Error ? e.message : 'Stornierung fehlgeschlagen.'))
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
        <div className="relative bg-white rounded-none shadow-[0_24px_48px_rgba(0,0,0,0.18)] w-full max-w-md mx-4 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0EB]" style={{ background: '#FAFAF8' }}>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] font-medium text-[#9B9B9B] mb-1"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Artikel stornieren
              </p>
              <p className="text-[#0A0A0A] leading-none"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 300 }}>
                {order.orderNumber ?? `#${String(order.id).slice(0, 8).toUpperCase()}`}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-none text-[#9B9B9B] hover:text-[#0A0A0A] hover:bg-[#F0F0EB] transition-all duration-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="p-3 bg-[#7A5C1E]/8 border border-[#7A5C1E]/20 rounded-none text-[11px]"
              style={{ fontFamily: 'var(--font-league-spartan)', color: '#5C4415' }}>
              ⚠️ {itemIds.length} Artikel werden storniert. Der gezahlte Betrag für diese Artikel wird automatisch erstattet.
            </div>

            <div>
              <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Grund *</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value as CancelReason)}
                className={INPUT}
                style={{ fontFamily: 'var(--font-league-spartan)' }}
              >
                {CANCEL_REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Notiz (optional, max 500 Zeichen)</label>
              <textarea
                rows={3}
                className={INPUT}
                value={note}
                onChange={e => setNote(e.target.value.slice(0, 500))}
                placeholder="z.B. Artikel am Lager beschädigt…"
                style={{ fontFamily: 'var(--font-league-spartan)', resize: 'vertical' }}
              />
            </div>

            {err && <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={submit}
                disabled={submitting}
                className={BTN_PRIMARY}
                style={{ background: '#8B1E3F', fontFamily: 'var(--font-league-spartan)', flex: 1, justifyContent: 'center' }}
              >
                {submitting ? 'Wird storniert…' : 'Stornieren'}
              </button>
              <button onClick={onClose} className={BTN_GHOST} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function ReconcileModal({
    order,
    item,
    onClose,
    onResolved,
  }: {
    order: ApiOrder
    item: ApiOrderItem
    onClose: () => void
    onResolved: (updated: ApiOrder) => void
  }) {
    const [action, setAction] = useState<'RECORD' | 'RELEASE'>('RECORD')
    const [refundId, setRefundId] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [err, setErr] = useState<string | null>(null)

    async function submit() {
      if (!item.cancellationClaimKey) { setErr('Kein Claim-Key auf diesem Artikel gefunden.'); return }
      if (action === 'RECORD' && !refundId.trim()) { setErr('Erstattungs-ID ist für "Erstattung gefunden" erforderlich.'); return }
      setSubmitting(true)
      setErr(null)
      try {
        const updated = await adminApi.orders.reconcileCancelItems(
          order.id,
          item.cancellationClaimKey,
          action,
          action === 'RECORD' ? refundId.trim() : undefined,
        )
        onResolved(updated)
      } catch (e: unknown) {
        const status = e instanceof FetchError ? e.status : 0
        setErr(reconcileCancelErrorMessage(status, e instanceof Error ? e.message : 'Klärung fehlgeschlagen.'))
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
        <div className="relative bg-white rounded-none shadow-[0_24px_48px_rgba(0,0,0,0.18)] w-full max-w-md mx-4 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0EB]" style={{ background: '#FAFAF8' }}>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] font-medium text-[#9B9B9B] mb-1"
                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Storno klären
              </p>
              <p className="text-[#0A0A0A] leading-none"
                style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 300 }}>
                {order.orderNumber ?? `#${String(order.id).slice(0, 8).toUpperCase()}`}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-none text-[#9B9B9B] hover:text-[#0A0A0A] hover:bg-[#F0F0EB] transition-all duration-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="p-3 bg-[#7A5C1E]/8 border border-[#7A5C1E]/20 rounded-none text-[11px]"
              style={{ fontFamily: 'var(--font-league-spartan)', color: '#5C4415' }}>
              ⚠️ Prüfe zuerst in Mollie, ob eine Erstattung für diesen Artikel existiert, bevor du hier etwas bestätigst.
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAction('RECORD')}
                className="flex-1 h-9 text-[12px] font-medium border transition-all duration-150"
                style={{ fontFamily: 'var(--font-league-spartan)', background: action === 'RECORD' ? '#370E4D' : '#fff', color: action === 'RECORD' ? '#fff' : '#6B6B6B', borderColor: action === 'RECORD' ? '#370E4D' : '#E8E8E8' }}
              >
                Erstattung gefunden
              </button>
              <button
                type="button"
                onClick={() => setAction('RELEASE')}
                className="flex-1 h-9 text-[12px] font-medium border transition-all duration-150"
                style={{ fontFamily: 'var(--font-league-spartan)', background: action === 'RELEASE' ? '#370E4D' : '#fff', color: action === 'RELEASE' ? '#fff' : '#6B6B6B', borderColor: action === 'RELEASE' ? '#370E4D' : '#E8E8E8' }}
              >
                Keine Erstattung
              </button>
            </div>

            {action === 'RECORD' && (
              <div>
                <label className={LABEL} style={{ fontFamily: 'var(--font-league-spartan)' }}>Mollie-Erstattungs-ID *</label>
                <input
                  type="text"
                  className={INPUT}
                  value={refundId}
                  onChange={e => setRefundId(e.target.value.slice(0, 64))}
                  placeholder="re_..."
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            )}

            {err && <p className="text-[11px] text-[#8B1E3F]" style={{ fontFamily: 'var(--font-league-spartan)' }}>{err}</p>}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={submit}
                disabled={submitting}
                className={BTN_PRIMARY}
                style={{ background: '#370E4D', fontFamily: 'var(--font-league-spartan)', flex: 1, justifyContent: 'center' }}
              >
                {submitting ? 'Wird geklärt…' : 'Bestätigen'}
              </button>
              <button onClick={onClose} className={BTN_GHOST} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
```

- [ ] **Step 7: Render the two new modals**

Change the final render block:

```tsx
      {cancelOrderData?.showDialog && cancelOrderData.order && (
        <CancelModal
          order={cancelOrderData.order}
          onClose={closeCancelDialog}
          onCancelled={(updated) => {
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
            closeCancelDialog()
          }}
        />
      )}
    </div>
  )
}
```

to:

```tsx
      {cancelOrderData?.showDialog && cancelOrderData.order && (
        <CancelModal
          order={cancelOrderData.order}
          onClose={closeCancelDialog}
          onCancelled={(updated) => {
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
            closeCancelDialog()
          }}
        />
      )}

      {itemCancelTarget && (
        <ItemCancelModal
          order={itemCancelTarget}
          itemIds={selectedItemIds}
          onClose={() => setItemCancelTarget(null)}
          onSuccess={(updated) => {
            setOrders(prev => prev.map(o => o.id === updated.id ? mergeOrder(o, updated) : o))
            setSelectedItemIds([])
            setItemCancelTarget(null)
          }}
          onOrderRefreshed={(fresh) => {
            setOrders(prev => prev.map(o => o.id === fresh.id ? mergeOrder(o, fresh) : o))
          }}
        />
      )}

      {reconcileTarget && (
        <ReconcileModal
          order={reconcileTarget.order}
          item={reconcileTarget.item}
          onClose={() => setReconcileTarget(null)}
          onResolved={(updated) => {
            setOrders(prev => prev.map(o => o.id === updated.id ? mergeOrder(o, updated) : o))
            setReconcileTarget(null)
          }}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 8: Run the build**

Run: `pnpm run build`
Expected: PASS — no type errors (checkbox handlers, modal props, `FetchError` narrowing all type-check).

- [ ] **Step 9: Run the full test suite**

Run: `pnpm run test:run`
Expected: PASS — this task added no new test files but must not have broken any existing one.

- [ ] **Step 10: Commit**

```bash
git add "app/(dashboard)/dashboard/admin/_components/Orders.tsx"
git commit -m "feat(admin): per-item order cancellation UI with reconcile flow"
```

---

### Task 6: Vendor `Fulfillment.tsx` — badge non-active items as "do not ship"

**Files:**
- Modify: `app/(dashboard)/dashboard/vendor/_components/Fulfillment.tsx`

No test file — pure UI composition over `isItemActive` (Task 1), already covered by that unit's own tests; `brandCanShip`'s new gating (Task 4) already flows into this file's existing `isPaid`/`isShipped` computations with no call-site change required.

**Interfaces:**
- Consumes: `isItemActive` (Task 1)

- [ ] **Step 1: Add the import**

Change:

```tsx
import { ownShipment, brandOrderStatus, brandCanShip } from '@/lib/brandRevenue'
```

to:

```tsx
import { ownShipment, brandOrderStatus, brandCanShip } from '@/lib/brandRevenue'
import { isItemActive } from '@/lib/orderItemCancellation'
```

- [ ] **Step 2: Badge non-active items in the expanded row's item list**

In the `OrderRow` component's expanded panel, change:

```tsx
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>Artikel</p>
                <div className="space-y-2">
                  {(order.items ?? []).map(item => (
                    <div key={item.id} className="flex items-center gap-2.5 text-[12px]">
                      <OrderItemThumb src={item.imageUrl} alt={item.productName ?? item.name ?? ''} width={30} />
                      {/* productName/variantSize/variantColor are what OrderItemResponseDto actually
                          sends; name/size/color exist only in pre-connect mock data (see
                          ApiOrderItem). Reading the legacy names left this row blank against the
                          real API — which in a packing view means no garment and no size. */}
                      <span className="text-[#2D2D2D] flex-1 min-w-0" style={{ fontFamily: 'var(--font-league-spartan)' }}>
                        {item.productName ?? item.name}
                        {(item.variantSize ?? item.size) ? <span className="text-[#9B9B9B]"> — {item.variantSize ?? item.size}</span> : null}
                        {(item.variantColor ?? item.color) ? <span className="text-[#9B9B9B]"> / {item.variantColor ?? item.color}</span> : null}
                        <span className="text-[#9B9B9B]"> × {item.quantity}</span>
                      </span>
                      <span className="font-medium text-[#0A0A0A] tabular-nums shrink-0">{fmtEur((item.priceAtPurchase ?? item.price ?? 0) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
```

to:

```tsx
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#9B9B9B] mb-2" style={{ fontFamily: 'var(--font-league-spartan)' }}>Artikel</p>
                <div className="space-y-2">
                  {(order.items ?? []).map(item => {
                    const active = isItemActive(item)
                    return (
                      <div key={item.id} className="flex items-center gap-2.5 text-[12px]">
                        <OrderItemThumb src={item.imageUrl} alt={item.productName ?? item.name ?? ''} width={30} />
                        {/* productName/variantSize/variantColor are what OrderItemResponseDto actually
                            sends; name/size/color exist only in pre-connect mock data (see
                            ApiOrderItem). Reading the legacy names left this row blank against the
                            real API — which in a packing view means no garment and no size. */}
                        <span className={`flex-1 min-w-0 ${active ? 'text-[#2D2D2D]' : 'text-[#9B9B9B] line-through'}`} style={{ fontFamily: 'var(--font-league-spartan)' }}>
                          {item.productName ?? item.name}
                          {(item.variantSize ?? item.size) ? <span className="text-[#9B9B9B]"> — {item.variantSize ?? item.size}</span> : null}
                          {(item.variantColor ?? item.color) ? <span className="text-[#9B9B9B]"> / {item.variantColor ?? item.color}</span> : null}
                          <span className="text-[#9B9B9B]"> × {item.quantity}</span>
                        </span>
                        {!active && (
                          <span className="text-[9.5px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                            Nicht versenden
                          </span>
                        )}
                        <span className="font-medium text-[#0A0A0A] tabular-nums shrink-0">{fmtEur((item.priceAtPurchase ?? item.price ?? 0) * item.quantity)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
```

- [ ] **Step 3: Run the build**

Run: `pnpm run build`
Expected: PASS.

- [ ] **Step 4: Run the full test suite**

Run: `pnpm run test:run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "app/(dashboard)/dashboard/vendor/_components/Fulfillment.tsx"
git commit -m "feat(vendor): badge cancelled/pending items as do-not-ship in fulfilment"
```

---

### Task 7: Customer `Bestellungen.tsx` — exclude non-active items from the return picker

**Files:**
- Modify: `app/(root)/account/components/Bestellungen.tsx`

No test file — pure UI composition over `isItemActive` (Task 1).

**Interfaces:**
- Consumes: `isItemActive` (Task 1)

- [ ] **Step 1: Add the import**

Change:

```tsx
import { describeShipment } from '@/lib/orderShipments'
```

to:

```tsx
import { describeShipment } from '@/lib/orderShipments'
import { isItemActive } from '@/lib/orderItemCancellation'
```

- [ ] **Step 2: Derive the returnable item list and use it everywhere the picker currently reads `order.items`**

Change:

```tsx
  const canReturn = order.status === 'DELIVERED'
  const hasReturn = [
    'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED', 'REFUNDED',
  ].includes(String(order.status))
```

to:

```tsx
  // An admin-cancelled (refunded) item must never be offered for a return — that would
  // double-refund it. Items with no cancellationState predate the feature and count as active.
  const returnableItems = order.items.filter(isItemActive)
  const canReturn = order.status === 'DELIVERED' && returnableItems.length > 0
  const hasReturn = [
    'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_RECEIVED', 'REFUNDED',
  ].includes(String(order.status))
```

Change the "Retoure einleiten" button handler:

```tsx
            {canReturn && !returnOpen && (
              <button
                onClick={() => {
                  setReturnItemIds(order.items.length === 1 ? order.items.map((i) => i.id) : [])
                  setReturnOpen(true)
                }}
```

to:

```tsx
            {canReturn && !returnOpen && (
              <button
                onClick={() => {
                  setReturnItemIds(returnableItems.length === 1 ? returnableItems.map((i) => i.id) : [])
                  setReturnOpen(true)
                }}
```

Change the return form's item checklist source:

```tsx
              {order.items.length > 0 && (
                <div>
                  <label className="font-league-spartan text-[11px] text-enunas-gray-medium mb-1.5 block">
                    Artikel auswählen *
                  </label>
                  <div className="space-y-1.5">
                    {order.items.map((item) => (
```

to:

```tsx
              {returnableItems.length > 0 && (
                <div>
                  <label className="font-league-spartan text-[11px] text-enunas-gray-medium mb-1.5 block">
                    Artikel auswählen *
                  </label>
                  <div className="space-y-1.5">
                    {returnableItems.map((item) => (
```

- [ ] **Step 3: Badge cancelled items in the always-visible order item list**

Change:

```tsx
          {order.items.length > 0 && (
            <div className="mb-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <OrderItemThumb
                    src={item.imageUrl}
                    alt={item.productName ?? item.name ?? ''}
                    width={44}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-league-spartan text-sm text-enunas-black leading-snug">
                      {item.productName ?? item.name ?? '—'}
                    </p>
                    {(item.variantSize || item.variantColor || item.size || item.color) && (
                      <p className="font-league-spartan text-[11px] text-enunas-gray-medium mt-0.5">
                        {[item.variantSize ?? item.size, item.variantColor ?? item.color]
                          .filter(Boolean)
                          .join(' · ')}
                        {item.quantity > 1 && ` · ×${item.quantity}`}
                      </p>
                    )}
                  </div>
                  <p className="font-league-spartan text-xs text-enunas-black flex-shrink-0">
                    {formatEuroDecimal(resolveItemTotal(item))}
                  </p>
                </div>
              ))}
            </div>
          )}
```

to:

```tsx
          {order.items.length > 0 && (
            <div className="mb-4 space-y-3">
              {order.items.map((item) => {
                const active = isItemActive(item)
                return (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                    <OrderItemThumb
                      src={item.imageUrl}
                      alt={item.productName ?? item.name ?? ''}
                      width={44}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'font-league-spartan text-sm leading-snug',
                        active ? 'text-enunas-black' : 'text-enunas-gray-medium line-through'
                      )}>
                        {item.productName ?? item.name ?? '—'}
                      </p>
                      {(item.variantSize || item.variantColor || item.size || item.color) && (
                        <p className="font-league-spartan text-[11px] text-enunas-gray-medium mt-0.5">
                          {[item.variantSize ?? item.size, item.variantColor ?? item.color]
                            .filter(Boolean)
                            .join(' · ')}
                          {item.quantity > 1 && ` · ×${item.quantity}`}
                        </p>
                      )}
                      {!active && (
                        <p className="font-league-spartan text-[11px] text-enunas-error mt-0.5">
                          Storniert &amp; erstattet
                        </p>
                      )}
                    </div>
                    <p className="font-league-spartan text-xs text-enunas-black flex-shrink-0">
                      {formatEuroDecimal(resolveItemTotal(item))}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
```

(`cn` is already imported at the top of this file — no new import needed for this step.)

- [ ] **Step 4: Run the build**

Run: `pnpm run build`
Expected: PASS.

- [ ] **Step 5: Run the full test suite**

Run: `pnpm run test:run`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add "app/(root)/account/components/Bestellungen.tsx"
git commit -m "fix(account): exclude cancelled/pending items from the return picker"
```

---

### Task 8: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `pnpm run test:run`
Expected: PASS — every test from Tasks 1–4, plus the full pre-existing suite, green.

- [ ] **Step 2: Run the production build**

Run: `pnpm run build`
Expected: PASS — no TypeScript errors anywhere in the touched files.

- [ ] **Step 3: Manual smoke check (requires a local backend on a profile that has shipped this feature)**

Not automatable in this repo — record as a follow-up for whoever has that backend running:
1. Cancel a subset of one brand's items on a paid multi-brand order → confirm the modal warns about the refund, the items show "Storniert" after success, the order stays PAID/PARTIALLY_SHIPPED.
2. Cancel the last active item of a brand → confirm that brand's "Versenden"/"Problem melden" disappear in the vendor dashboard (log in as that brand, or re-check `Fulfillment.tsx` with a seeded order).
3. Force a 409 (e.g. try to cancel an item after its brand shipped) → confirm the inline German error and that the order refreshes.
4. Confirm the whole-order "Stornieren" button disappears the moment any item shows "Storniert" or "Storno läuft…".
5. As a customer, open the order and confirm a cancelled item cannot be selected for a return.

- [ ] **Step 4: Report the red/green evidence**

Summarize, per `CLAUDE.md`'s testing procedure: for each of Tasks 1–4, the failing-test output from Step 2 of that task and the passing-test output from its final test-run step.
