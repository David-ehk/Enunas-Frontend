# Backend handoff — unpaid orders, payment outcome, production readiness

**From:** frontend (Next.js) · **To:** Spring backend · **Date:** 15 Sep 2026
**Context:** multi-brand checkout audit. Everything under "Evidence" was observed against production
(`https://api.enunas.com`) with the test accounts on 15 Sep 2026. Everything under "Questions" could
not be verified from the frontend repo and needs an answer from the Spring side.

Priorities: **P1** = before real customer traffic · **P2** = before a marketing push · **P3** = nice to have.

---

## 1. Brand partners see orders that were never paid — P1

### Evidence

`GET /brand/orders` returns `CANCELLED` orders that were never paid. Every one of them was created and
cancelled ~30 minutes later by the expiry job, i.e. an abandoned or failed checkout:

| Order | Brand(s) | createdAt | updatedAt (cancelled) |
|---|---|---|---|
| (brand 5) | Claude Testmarke 0109 | 2026-09-04 16:10 | 16:41 |
| (brand 5) | Claude Testmarke 0109 | 2026-09-04 18:43 | 19:16 |
| (brand 5) | Claude Testmarke 0109 | 2026-09-07 21:28 | 22:02 |
| `ENS-2026-3I731Z` | brands 5 **and** 6 | 2026-09-14 13:07 | 13:38 |

The `shipments[]` rows on those orders also still read `status: AWAITING_SHIPMENT`, although the
order is cancelled.

A partner reasonably asks "why was my order cancelled?" for an order that never existed
commercially — and a list of failed checkouts only discourages partners.

**Frontend stopgap (15 Sep 2026):** `brandApi.orders.getAll` now drops every `PENDING` and
`CANCELLED` order, and the vendor "Storniert" tab is gone. Side effect until §1.3 lands: a
*paid-then-admin-cancelled* order is hidden from the brand too, because the frontend cannot tell it
apart from an abandoned checkout. Cancellation rates stay visible to admins (`/admin/orders`).

### Requested

1. `GET /brand/orders` (and any brand-scoped aggregate: dashboard counts, payouts, reconciliation)
   returns only orders that **reached `PAID` at least once**. Suggested: persist `paidAt` when the
   webhook confirms payment and filter `paidAt IS NOT NULL`. That keeps a *paid-then-cancelled*
   order visible to the brand (it is a real event for them) while hiding abandoned checkouts.
2. When an order is cancelled, move its `shipments[]` rows out of `AWAITING_SHIPMENT`
   (e.g. `CANCELLED`) so no consumer can read them as "still owes a parcel".
3. Expose `paidAt` on `OrderResponseDto`. The frontend needs it to tell "payment failed" apart from
   "paid, later cancelled by admin" (see §2).

### Questions

- **Brand notifications:** is any email/notification sent to a brand partner when an order is
  *created*? It must only fire after the webhook sets `PAID`, never on `PENDING`. Please confirm
  where this is triggered.
- Same for the customer: the "Bestellbestätigung" email must not be sent on order creation.

---

## 2. Payment outcome after the Mollie redirect — P1

### Evidence

- Mollie redirects back to `/orders/{orderNumber}/confirmation` after **every** outcome (paid,
  cancelled, failed, expired).
- `GET /orders/{orderNumber}` answers **400** `Invalid value 'ENS-2026-3I731Z' for 'orderId'` — only
  the numeric id works. The confirmation page therefore never loaded order details.
- A cancelled/failed Mollie payment leaves the order `PENDING` until the expiry job (~30 min),
  judging by the timestamps above.

### Frontend change already made (this release)

- The confirmation page resolves the order number through `GET /orders/me` (newest first, first 20),
  and only shows "Bestellung bestätigt" once status has left `PENDING`. It polls a `PENDING` order
  every 3 s for ~30 s, then shows "Zahlung noch nicht bestätigt" with a re-check button.
  `CANCELLED` shows "Zahlung nicht abgeschlossen".
- The cart is no longer emptied before the Mollie redirect; it is cleared only once that exact order
  is confirmed paid.

### Requested

1. **Look-up by order number:** accept the order number on `GET /orders/{orderNumber}` (ownership
   check as today), or add `GET /orders/number/{orderNumber}`. The current workaround breaks if a
   customer has more than 20 newer orders — unlikely, but not correct.
2. **Cancel promptly on a terminal Mollie status:** when the webhook reports `failed`, `canceled` or
   `expired`, cancel the order immediately (and release stock, §3) instead of waiting for the
   30-minute expiry job. The customer then sees "Zahlung nicht abgeschlossen" right away instead of a
   30-minute "noch nicht bestätigt".
3. **Payment status on return:** optionally, on `GET` of a `PENDING` order, ask Mollie for the
   payment status if the webhook has not arrived yet (webhook delivery can lag or fail). This
   removes the dependency on webhook timing for the confirmation page.

---

## 3. Stock under concurrent checkouts — P1

Could not be verified from the frontend. Please answer each point.

1. **Overselling:** two customers buy the last unit of the same variant at the same moment. Is the
   stock decrement atomic — `UPDATE … SET stock = stock - :qty WHERE id = :id AND stock >= :qty`
   and a check of the row count, or a pessimistic lock / `@Version` optimistic lock with retry? A
   read-then-write in the service layer oversells under load.
2. **When is stock taken?** At `PENDING` (order creation) or at `PAID` (webhook)?
   - If at `PENDING`: abandoned checkouts hold stock for up to 30 minutes. Under a drop or a
     campaign, items can appear sold out while nobody is paying. Consider a shorter hold (10–15 min,
     aligned with the Mollie payment expiry) and releasing stock immediately on a terminal Mollie
     status (§2.2).
   - If at `PAID`: two customers can both pay for the last unit. There must be a defined outcome
     (automatic refund + cancellation + customer email) — please describe it.
3. **Expiry job releases stock:** confirm the 30-minute auto-cancel restores stock for every item,
   across all brands of a multi-brand order, and is idempotent if it runs twice or overlaps with a
   late webhook.
4. **Duplicate checkouts:** a customer who comes back from a failed payment still has a full cart
   (by design now) and can place the order again. That creates a second `PENDING` order while the
   first is still holding stock. Consider cancelling the customer's older `PENDING` orders with the
   same items when a new one is created, or at least confirm the stock hold is released correctly.

---

## 4. Webhook robustness — P1

1. **Idempotency:** Mollie can deliver the same webhook more than once. Handling `paid` twice must
   not double-count revenue, create two payout ledger entries, or send emails twice. Is processing
   keyed on the payment id + state transition?
2. **Ordering / races:** a `paid` webhook arriving *after* the expiry job already cancelled the order
   (customer paid at minute 29, webhook at minute 31). What happens? The money is captured, so this
   must end in either a restored `PAID` order or an automatic refund — never a silently cancelled,
   paid order.
3. **Verification:** the webhook handler re-fetches the payment from the Mollie API rather than
   trusting the request body (Mollie only sends the id). Please confirm.
4. **Missed webhooks:** is there a reconciliation job that polls Mollie for `PENDING` orders older
   than N minutes? Without it, a lost webhook turns a paid order into a cancelled one.

---

## 5. Capacity — P2

1. **Load test** on a staging copy (not production — it would create real orders and hold stock):
   concurrent `POST /orders` across multi-brand carts, plus `GET /products` / `GET /products/{id}`
   browse traffic. Report p95 latency and error rate at 50 / 200 concurrent users.
2. **DB connection pool:** HikariCP `maximumPoolSize` vs. PostgreSQL `max_connections` and the number
   of app instances. Order creation touches several tables in one transaction — how long is it held?
3. **Single EC2 instance:** is there more than one app instance behind a load balancer, and a health
   check that restarts a hung instance? The expiry job and payout generation must not run twice
   when a second instance is added (ShedLock or equivalent).
4. **Mollie calls inside the DB transaction:** if order creation holds the transaction open while
   calling Mollie's API, a slow Mollie response exhausts the connection pool under load. The
   commit-order-then-call-Mollie approach already in place (per the 31 Aug handoff) should keep the
   HTTP call outside the transaction — please confirm.
5. **Rate limiting** on `POST /orders`, `POST /orders/preview` and `POST /auth/login` (the preview is
   called on every address/coupon change during checkout).

---

## 6. Multi-brand order status with 3+ brands — P2

Carried over from the 10 Sep re-test prompt (B1.6): the order-level aggregate
`PAID → PARTIALLY_SHIPPED → SHIPPED` is computed backend-side and was only verified with **two**
brands. Please confirm it is a fold over all `shipments[]` rows, so 2 of 3 shipped stays
`PARTIALLY_SHIPPED`.

---

## 7. `api.enunas.com` answers 502 Bad Gateway — P1

### Evidence

Observed 21 Sep 2026 ~00:01 UTC. **Every** endpoint returns nginx `502 Bad Gateway`, including the
root, `OPTIONS` preflights, `GET /products?size=3` and `GET /users/me`: the Spring app behind nginx is
not answering (crashed, stopped, or out of memory on the single EC2 instance, §5.3).

In the browser this surfaces as a misleading **CORS** error (`No 'Access-Control-Allow-Origin' header`
from origin `http://localhost:3000`), because the nginx error page carries no CORS headers. It is not a
CORS misconfiguration — do not change the CORS config until the app is back up and the error persists.

Effect on the frontend: every client-side fetch fails, so homepage feeds, catalogue recommendations
and account data render empty.

**Update 25 Sep 2026:** confirmed back up (`GET /products` → 200, with and without auth). Root cause of
the outage itself still unconfirmed — items 1–2 below stay open so it doesn't recur silently.

### Requested

1. Restart / inspect the Spring service (`journalctl`, OOM killer, DB connection pool exhaustion).
2. Add a health check + auto-restart (systemd `Restart=on-failure` or an ALB health check) and an alert
   on 5xx from nginx — the outage was found by the frontend, not by monitoring.
3. ~~Once up, re-check a preflight from `http://localhost:3000`~~ — done 25 Sep 2026, no CORS issue.

---

## Summary checklist

- [ ] §7 backend back up (502), health check + restart + 5xx alert

- [ ] §1.1 `/brand/orders` excludes never-paid orders (`paidAt IS NOT NULL`)
- [ ] §1.2 shipment rows leave `AWAITING_SHIPMENT` on cancellation
- [ ] §1.3 `paidAt` on `OrderResponseDto`
- [ ] §1 Q brand + customer emails only after `PAID`
- [ ] §2.1 look-up by order number
- [ ] §2.2 immediate cancel on terminal Mollie status
- [ ] §2.3 (optional) Mollie status fallback for `PENDING`
- [ ] §3.1–3.4 atomic stock, hold window, release on expiry, duplicate checkouts
- [ ] §4.1–4.4 webhook idempotency, late-paid race, verification, reconciliation job
- [ ] §5.1–5.5 load test, pool, instances + scheduled-job locking, Mollie outside transaction, rate limits
- [ ] §6 3-brand aggregate status
