# Enunas — E2E bug re-test prompt

Paste everything below into a fresh Claude Code session (with chrome-devtools MCP available).
It re-verifies every bug found during the 2026-09-09/10 production E2E test.

---

You are re-testing the Enunas marketplace against **production** (`https://www.enunas.com`,
API `https://api.enunas.com`). Use the chrome-devtools MCP. Work through every section, and for
each numbered check report **PASS / FAIL / BLOCKED** with the evidence (screenshot, network entry,
or API response). Do not fix anything unless asked — this run is verification only.

## Accounts (all password `EnunasTest2026!` unless noted)

| Role | Login | Notes |
|---|---|---|
| Brand A | `davidemmanuel.konan+enunas0109@gmail.com` | "Claude Testmarke 0109", brand id 5 |
| Brand B | `davidemmanuel.konan+enunas0109b@gmail.com` | "Claude Testmarke 0109B", brand id 6 |
| Customer | `davidemmanuel.konan+kunde0903@gmail.com` | |
| Admin | `enunas.munich@gmail.com` | **Password unknown — ask the user to type it on screen.** Never request or store it. |

## Environment gotchas (hit every time)

- **Mollie is in test mode.** On the card page use `4543 4740 0224 9996`, any future expiry, CVC `123`,
  any name; on the following "final payment status" page choose **Bezahlt**.
- **Admin writes are CORS-blocked from `localhost`.** Any `PATCH`/`POST` to `/admin/*` only works from
  the `https://www.enunas.com` origin. Run all admin steps on the deployed site, not a local dev build.
- **Role sessions share `localStorage['enunas_token']` per origin** (dashboard + storefront are the same
  origin). Open each role in its own **isolated browser context** (`new_page` with `isolatedContext`)
  so admin/customer/brand sessions don't clobber each other.
- If a chrome tool errors "browser is already running … chrome-profile": kill the orphaned root
  `chrome.exe` whose command line contains `chrome-devtools-mcp` and has no `--type=` flag, then retry.
- For a **local** dev build (`pnpm run dev`; `.env.local` already points at the prod API): if start
  fails on a lock, kill the orphaned `next dev` node process and delete `.next/dev/lock`.

---

## A. Core E2E regression flow (must still work end to end)

Reference order from the last run: **`ENS-2026-4UZ3AX`** (now `REFUNDED`). Create a *fresh* order for
this run — don't reuse it.

1. **Coming-soon product.** As Brand A: Produkte → Neues Produkt → fill all required fields, set
   **Release-Datum** to a future date, 2+ variants, a price, skip "Look", create.
   - PASS if: product lands `ACTIVE` immediately, and its storefront PDP
     (`/bekleidung/claude-testmarke-0109/<slug>`) shows a live countdown, "Kommt am <date>", a
     disabled `COMING SOON` button, **no price**, no add-to-cart. API: `preview:true`, `price:null`.
2. **Catalog + Complete the Look.** As Brand B: create 3 products (jacket / tee / trousers), each with
   1 image, 2 variants, a DE listing. Edit the jacket → "Vervollständige den Look" → tick the checkbox
   → select the tee + trousers → save.
   - PASS if: all 3 are `ACTIV`; jacket PDP "Vervollständige den Look" row shows exactly the tee +
     trousers (`completeTheLookProducts` in the API confirms).
3. **4-item cross-brand order.** As Customer (isolated context): add Brand A's live product (size M),
   then from Brand B's jacket PDP open each "Complete the Look" item and add the jacket + tee +
   trousers. Cart = 4 items across 2 brands. Checkout → Mollie test card → **Bezahlt**.
   - PASS if: confirmation page shows, order status `PAID`, `GET /orders/me` lists 4 items, total
     matches subtotal + one shipping line **per brand**.
4. **Dual-brand fulfilment.** As Brand A: Bestellungen → Versenden the one item (DHL + tracking).
   Order goes `PARTIALLY_SHIPPED`. **Then as Brand B** (see check B1) ship its 3 items. Order → `SHIPPED`.
5. **Deliver.** As Admin on `www.enunas.com`: Bestellungen → expand the order → Status ändern →
   `DELIVERED` → Speichern. PASS if row shows `GELIEFERT`.
6. **Return request.** As Customer: order detail → "Retoure einleiten" → pick a reason → submit.
   - PASS if: order → `RETURN_REQUESTED`; `GET /orders/me` shows **one return per brand**
     (`returns[]`, each `status: REQUESTED`).
7. **Return processing.** As Admin: Rückgaben → for **each** brand return: "Retoure genehmigen" →
   "Wareneingang buchen" → "Erstattung auslösen" (leave amount empty).
   - PASS if: both returns → `REFUNDED` with the brand's product subtotal as `refundAmount`; order → `REFUNDED`.
8. **Brand sees the return.** As Brand B: Retouren tab.
   - PASS if: the return is listed with the full lifecycle badge (`ERSTATTET`), all its items, the
     reason, and the frozen return-address snapshot.

---

## B. Specific bug re-checks

### B1 — P1: multi-brand "second brand can't ship" (was fixed in `Fulfillment.tsx`; helpers moved to `lib/brandRevenue`, backend `/brand/orders` status also brand-scoped)

Setup: a multi-brand `PAID` order where **another** brand has already shipped (so the global order
status is `PARTIALLY_SHIPPED` / `SHIPPED`). Log in as the brand that has **not** shipped → Bestellungen.

- B1.1 The `VERSANDBEREIT` stat counts this order.
- B1.2 The "Versandbereit" tab lists it.
- B1.3 The row shows a working **"Versenden"** button; completing the ship modal moves the row to
  `VERSANDT` with a correct per-carrier tracking link (from *this brand's* shipment, not the order scalar).
- B1.4 The status badge reads this brand's own state (`BEZAHLT` while it still owes a parcel), **not**
  `PARTIALLY_SHIPPED`.
- B1.5 **Regression:** a single-brand `PAID` order for the same brand still shows "Versenden" and
  still counts under `VERSANDBEREIT` — unchanged from before.
- B1.6 **3+ brands:** an order spanning three brands — after brand 1 ships, brands 2 **and** 3 can
  still each ship independently through the dashboard.

  > **Status (10 Sep 2026): not separately tested — deprioritised, not cleared.**
  > The per-brand view is structurally low-risk: `ownShipment()` is a pure per-row
  > `shipments.find(brandId)` with no brand-count logic, and a repo-wide grep confirmed a single
  > brand-scoped aggregation path (vendor `Overview.tsx` `openOrders`/`toShip` both go through
  > `brandOrderStatus`; `pendingReturns` through `returns[].brandId`). The only raw `o.status`
  > order filters left are `admin/_components/Overview.tsx:159,167`, which are intentionally
  > platform-global.
  > The 2-brand flow is verified live (order `ENS-2026-TFZNYE`: brand A ships → `PARTIALLY_SHIPPED`
  > → brand B ships → `SHIPPED`). **3 brands were never run.**
  > **What this analysis does NOT cover:** the order-level aggregate status
  > (`PAID → PARTIALLY_SHIPPED → SHIPPED`) is computed **backend-side** — no frontend code produces
  > it, `brandOrderStatus()` only reads it. The untested state is **N−1-of-N shipped for N ≥ 3**
  > (e.g. 2 of 3 shipped must stay `PARTIALLY_SHIPPED`); a two-branch `if/else` there rather than a
  > fold would mishandle it. Reviewing that belongs in the Spring repo, not here. The interesting
  > variable is the third *shipment row*, not the third *brand*.
  > Also noted (pre-existing, orthogonal): `brandOrderStatus()` falls through to `return global` when
  > a brand has no `shipments[]` row (legacy orders) or its row is `PROBLEM` — in those two paths a
  > brand can still see a raw `PARTIALLY_SHIPPED` badge.
- B1.7 **Übersicht tiles** (was bug #4): as the not-yet-shipped brand, the "OFFEN" / "versandbereit"
  tile on Übersicht counts this multi-brand order (should use the same `brandOrderStatus` helper now).

### B2 — P1: brand banner / logo upload (NOT expected fixed unless the S3 bucket CORS was changed)

As Brand A or B: Einstellungen → "Hero-Bild hochladen" (and "Logo hochladen") → choose any JPG/PNG.

- B2.1 Upload succeeds (no "Upload zu S3 fehlgeschlagen (Netzwerk- oder CORS-Fehler)").
- B2.2 DevTools Network: the `OPTIONS` preflight to
  `https://enunas-brand-previews-926583575598-eu-central-1-an.s3.eu-central-1.amazonaws.com/...`
  returns **200** (was 403), and the `PUT` succeeds (was `net::ERR_FAILED`).
- B2.3 The hero image then renders on the public brand page `/marken/claude-testmarke-0109b`.
- (Reference: product-image uploads already work — different bucket `enunas-clothing-images-*`.)

### B3 — P2: colourway-specific product images (NOT expected fixed unless backend + UI changed)

Use a product with 2+ colours (e.g. Brand B "Enunas Nomad Jacket" = BLACK + WHITE).

- B3.1 Vendor "Produktbilder" section lets you attach an image **to a specific colour**.
- B3.2 On the PDP, toggling the colour swatch swaps the gallery to that colour's images.
- B3.3 API: `GET /products/{id}/media/images` items carry a colour/colorFamily field.

### B4 — P2: admin Orders search crash (NOT expected fixed unless the admin Orders component changed)

As Admin: Bestellungen → type any text into the "Order-ID, Kundenname…" search box.

- B4.1 The list filters and **no error boundary** appears (was `TypeError: o.id.toLowerCase is not a
  function` → "Ein Fehler ist aufgetreten", whole `<Orders>` view dead).
- B4.2 Vendor `Fulfillment.tsx` search box (Bestellungen) — same latent `o.id.toLowerCase()` — type
  in it and confirm no crash.

### B5 — P3: customer partial return (NOT expected fixed unless `Bestellungen.tsx` changed)

As Customer: a `DELIVERED` multi-item order → "Retoure einleiten".

- B5.1 The return form lets you **choose which item(s) / quantity** to return (was reason + free-text
  only).
- B5.2 Submitting a single-item return creates a return containing **only that item** (was: fans out
  to every item of every brand — one brand-return per brand, each holding all that brand's items).
- B5.3 `ReturnRequestDto` in the request body carries `orderItemId`.

### B6 — P3: admin order-detail cosmetics (NOT expected fixed)

As Admin: Bestellungen → expand any multi-item order.

- B6.1 Each line item shows its real `priceAtPurchase` (was every line `€ 0,00`).
- B6.2 After a "Status ändern" save, the row's TRACKING column still shows the shipments (was blanked
  to `—` even though `shipments[]` still had carrier + tracking).

### B7 — Feature request: product thumbnails in order views (only if `OrderItemResponseDto` gained `imageUrl`)

- B7.1 Customer account → order detail: each item row shows a product thumbnail.
- B7.2 Brand-partner Bestellungen (list + expanded row) shows a thumbnail per item.
- (If `OrderItemResponseDto` still has no `imageUrl`, this is BLOCKED — nothing to render.)

---

## Reporting

Produce a table: check ID · PASS/FAIL/BLOCKED · evidence · (for FAIL) the exact error / diff from
expected. Call out any *new* regressions the flow surfaces.
