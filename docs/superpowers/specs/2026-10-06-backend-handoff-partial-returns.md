# Backend handoff: partial returns + return-refund money fixes

**From:** frontend (Next.js) · **To:** Spring backend · **Date:** 6 Oct 2026
**Context:**
- Production E2E run of 30 Sep 2026 (`docs/superpowers/plans/2026-09-30-brand-colourway-e2e-test.md`, report in `e2e/reports/2026-09-30-brand-colourways-report.md`).
- The backend session's returns analysis of 6 Oct 2026.

**Decision (user, 6 Oct 2026): option (b).** Partial returns ship together with **all three** return-refund bugs:
1. Refund ceiling uses the pre-discount price.
2. Ledger reversal is pro-rata across the brand's items instead of exact per unit.
3. Duplicate-refund guard relies only on Mollie's idempotency key.

Priorities: **P1** = before real customer traffic · **P2** = before a marketing push · **P3** = nice to have.

---

## 1. What the frontend confirms from production

Observed on `https://api.enunas.com`. Line numbers below are the backend session's, not verified from this repo.

| Backend claim | Frontend / production evidence |
|---|---|
| The request has no quantity; `doRequestReturn` always returns the whole line (`OrderService.java:630`) | The frontend's `ReturnRequestDto` (`lib/api/modules/orderApi.ts:35`) is `{ orderItemId?, reason, description? }`. **RET-2026-1FVC6C** (order ENS-2026-1TWSCJ, id 27) returned the whole P1 RED S **×2** line (`orderItemIds: [49]`), although the customer wanted 1. The admin typed **69,95** as the refund amount by hand to stand in for "1 of 2". |
| Receiving restocks `quantityReturned` (`OrderService.java:1384`) | P1 RED S stock: 5 → 3 after the order → **5** after "receive". Both units came back, consistent with `quantityReturned = 2`. |
| The "already returned?" check is all-or-nothing (`findReturnedOrderItemIds`) | Matches the frontend model: returns arrive as `orderItemIds: string[]` only (`types/api.ts:52`), with no quantities. |
| Bug 3: the guard is Mollie's idempotency key only | Mollie keeps idempotency keys only for a short window (about 1 hour), so a retry after that can refund twice. Partial returns make **several refunds per order line normal** (unit 1 now, unit 2 later), which makes this more likely, not less. |

---

## 2. Requirements (backend)

### 2.1 Partial quantity on the request (P1)
- `POST /orders/{orderId}/return` accepts `quantity?: number`. **Missing means the whole remaining quantity of the line**, so the current frontend keeps working unchanged.
- **Valid range:** `1 ≤ quantity ≤ returnable(line)`, where
  `returnable(line) = line.quantity − Σ quantityReturned over open and completed returns − cancelled units of that line`.
  - Per-item cancellation already exists, and **cancelled units must never be returnable.**
  - Out of range → **400** with a stable `code` (e.g. `RETURN_QUANTITY_EXCEEDED`), so the frontend can show German copy (see `lib/api/errorCopy.ts`).
- **Concurrency:** two simultaneous requests for the same line must not together exceed `line.quantity`. Use a row lock on the order line, or a unique/check constraint on the summed quantity. "Check, then insert" without a lock is not enough.
- The second unit stays returnable later. `findReturnedOrderItemIds` becomes a per-line sum of returned units instead of a set of ids.

### 2.2 Quantities in the response (P1, missing from the backend draft)
The request alone isn't enough: today `ReturnSummary` only carries `orderItemIds`, so no client can show "1 of 2 returned" or compute what's still returnable. Add to every `returns[]` entry on `OrderResponseDto` (customer, brand and admin views):

```jsonc
"items": [
  { "orderItemId": 49, "quantityReturned": 1, "refundableAmount": 69.95 }
]
```

- Keep `orderItemIds` for one release for compatibility.
- Optional but useful: `returnableQuantity` per order item on `items[]`, so the client doesn't recompute the rule from 2.1.

### 2.3 One request, several lines (P2, decide in the spec)
Today the frontend sends **one request per selected item** (`app/(root)/account/components/Bestellungen.tsx:87`). With quantities, define one of these:
- (a) Accept `items: [{ orderItemId, quantity }]` and create **one return per brand** for all lines of that brand.
- (b) Keep one line per request, but merge requests from the same customer, order and brand into the open `REQUESTED` return.

Either way, specify what the customer sees: one return number per brand, as today.

### 2.4 Refund amount = what the customer actually paid for those units (P1, bug 1, extended)
"Discounted" means **two** things here, and the ceiling must account for both:
1. **Sale price:** `discountPriceAtPurchase` (P1: 89,95 → **69,95**).
2. **Discount code:** order-level codes such as a brand code (V14 on 4 Oct: `E2E0930` −10 % applied **only** to Brand A's items, P1 69,95 → −6,99).

Per-unit refund = `(line gross actually paid after sale price and after its share of any code discount) / line.quantity`.

- **Rounding:** allocate cents so that the sum of all unit refunds of a line equals exactly what was paid for the line, e.g. the last unit takes the remainder. A 2-unit line with a 6,995 € code share must not refund 6,99 + 6,99 or 7,00 + 7,00.
- The refund ceiling for a return = Σ per-unit refund over its returned units, minus any amount already refunded on those units.
- `POST /admin/returns/{returnNumber}/refund` **without** `refundAmount` refunds exactly that ceiling. The admin no longer needs to type an amount; the optional amount remains a cap for goodwill or damaged returns.
- Reuse the per-item cancellation's "discounted per-item amount" logic, as the backend draft suggests.

### 2.5 Ledger reversal per returned unit (P1, bug 2)
Reverse exactly the returned units' commission and brand share, not pro-rata across all of the brand's items. Reuse the per-item cancellation's exact per-item reversal. Afterwards, `GET /admin/reconciliation/{brandId}` must show **no drift**.

### 2.6 Duplicate-refund guard (P1, bug 3)
Record the refund claim (e.g. `PENDING` with a unique key per return and attempt) **before** calling Mollie, then confirm or release it. This is the same pattern as per-item cancellation, including its 5-minute "reconcile" rule. A retry hours later must find the existing claim and never call Mollie a second time.

### 2.7 Shipping on partial returns (P2, define explicitly)
Is outbound shipping refunded on a partial return: never, proportionally, or only when the whole order comes back? Pick one, write it into the spec and the AGB copy, and make the ledger consistent with it.

---

## 3. Acceptance tests (backend)

Use real shapes from production order **ENS-2026-1TWSCJ** (id 27). Its Brand A lines:
- P1 BLACK M ×1 at 69,95
- P1 RED S ×2 at 69,95 each (sale from 89,95)
- P2 GREEN M ×1 at 39,95

Its Brand B line: P3 BEIGE L ×1 at 59,95.

1. Return **1 of 2** RED S → `quantityReturned = 1`. After receive: stock +1, not +2. Refund without an amount → **69,95** (not 89,95, not 139,90). Ledger reverses one unit only. Reconciliation drift = 0.
2. Later, return the **2nd** RED S unit → allowed, refund 69,95. A **3rd** request → 400 `RETURN_QUANTITY_EXCEEDED`.
3. Two concurrent requests for 2 units each on a ×2 line → exactly one succeeds.
4. A line with 1 of 2 units **cancelled** (per-item cancellation) → at most 1 returnable.
5. Line bought with a brand code (−10 %), 2 units, code share 6,995 € → the two unit refunds sum to exactly what the line cost after sale price and code (cent-exact), and their difference is at most 0,01.
6. A refund retried after the Mollie key window (simulate: same return, second refund call later) → no second Mollie refund; the existing claim is returned.
7. A request without `quantity` → behaves exactly as today (whole remaining line).

---

## 4. Frontend work in this repo (after the contract is final)

**Blocked on the field names from 2.1/2.2.** Shipping it earlier would send an unknown field: the backend rejects unknown fields with 400 (seen with `active` on `POST /brand/discounts`).
- `ReturnRequestDto.quantity?` (`lib/api/modules/orderApi.ts`), sent **only** when k < line quantity, so full returns stay byte-identical.
- Quantity selector per line in the customer return form (`app/(root)/account/components/Bestellungen.tsx`), capped at `returnableQuantity`.
- Show "k von n" in the brand's Retouren view (`VendorReturns.tsx`), in admin returns (`admin/_components/Returns.tsx`), in the customer order detail and in emails.
- Admin refund: prefill and display the backend ceiling, and drop the manual amount as the normal path.
- German copy for `RETURN_QUANTITY_EXCEEDED` in `lib/api/errorCopy.ts`.
- Tests first for each (`lib/` pure functions: returnable quantity display, request body builder).

---

## 5. Other backend findings from the 30 Sep production run

These aren't part of the partial-returns spec, but they're open and need the backend:

| Prio | Issue | Evidence |
|---|---|---|
| P1 | **Admin "delivered" uses the deprecated `PATCH /admin/orders/{id}/status`**, which CLAUDE.md says is removed next release. There is no replacement endpoint for `SHIPPED → DELIVERED`. Removing it without a replacement breaks the return flow, since returns require DELIVERED. | `lib/api/modules/adminApi.ts:118`; ENS-2026-1TWSCJ set DELIVERED on 30 Sep, 20:27 |
| P1 | Admin settlement shows **607,24 €** due to brand 5, but the brand dashboard shows **0,00 €**; `POST /admin/payouts/generate` returns `[]` with no feedback | settlement 2026-09, brand 5 |
| P2 | Mollie **Failed / Canceled** sends the customer back to Mollie's method page, not to the shop. The order stays `PENDING` until the 30-min auto-cancel. A retry creates a **second** PENDING order for the same cart. | ENS-2026-FPRD0G, ENS-2026-TK3E1I |
| P2 | `AdminProductResponseDto` has no price and no SKU (the admin list showed € 0,00; the frontend now shows "—"). The create response has `colors[]` empty (colour ids only via `variants[].colorId`). | `GET /admin/products` |
| P2 | Products are created **ACTIVE** immediately, while the wizard copy promises review and approval. Decide: auto-publish (frontend copy changes) or moderation (backend). | `POST /products/create` → `status: ACTIVE` |
| P3 | Phone number is not stored on saved addresses (the address-book DTO has no phone). | saved address id 7 |
| P3 | Customer order items carry no `brandName`, so the account order detail can't group by brand. | `GET /orders/27` |
| P3 | No image is set as primary automatically on upload. | Phases A/B |
