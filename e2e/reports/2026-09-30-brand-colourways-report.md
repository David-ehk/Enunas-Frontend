# Brand colourway E2E: production run report

**Run:** 30 Sep 2026, against **https://www.enunas.com** (production API, Mollie test key). Local fixes were verified on 4 Oct 2026.
**Method:**
- chrome-devtools MCP, driving only real buttons and inputs.
- One isolated browser context per role (admin, Brand A, Brand B, customer).
- The admin session was logged in by the user. Claude never saw or typed the admin password.

**Plan:** `docs/superpowers/plans/2026-09-30-brand-colourway-e2e-test.md`
**Evidence:**
- `e2e/reports/2026-09-30-brand-colourways-ledger.md`, one line per control/check
- `e2e/reports/2026-09-30-state.md`, ids, orders and email list
- `e2e/reports/2026-09-30/*.png`, screenshots

## Summary

| Phase | Scope | PASS | FAIL |
|---|---|---|---|
| A | Brand A creates P1 (3 colours) and P2 through the wizard; per-colour images; admin view | 65 | 8 |
| B | Brand B creates P3 | 9 | 3 |
| C | Every storefront surface, desktop and mobile; PDP; saved lists | 47 | 13 |
| D | Multi-brand cart and checkout; paid, failed and cancelled payments | 29 | 10 |
| E | Fulfilment for both brands; delivery; return → refund; admin cancel; every brand dashboard view | 62 | 37 |
| F | Authorization; edge cases; keyboard | 17 | 7 |
| **Total** | | **224** | **78** |

**The core question:** do the different pictures show for each colour everywhere? Mostly yes:
- **Where it works:**
  - PDP gallery per swatch: RED shows only RED + shared images, BLACK shows BLACK-2 first, and so on.
  - `?color=` deep links.
  - Cart, checkout, confirmation and order lines: each shows its own colour's photo.
  - A colour without photos (P2 GREEN) falls back to the shared image on the PDP and in the cart.
- **Exceptions on production, now fixed locally (see below):**
  - The P2 GREEN *listing card* showed the BLUE photo.
  - Homepage cards paired the BLACK photo with a RED swatch.
  - Saved favourites lost the colour.

**Multi-brand order ENS-2026-1TWSCJ** (Brand A: P1 BLACK M, P1 RED S ×2, P2 GREEN M; Brand B: P3 BEIGE L):
- Paid through Mollie test mode.
- Each brand saw **only its own lines** and shipped its own parcel.
- Admin set the order to delivered.
- Return RET-2026-1FVC6C (Brand A only) went approved → received → refunded (69,95 €).
- A second order, ENS-2026-1PV2Y8, was cancelled by admin and refunded through Mollie.
- The failed and cancelled payments were auto-cancelled after 30 minutes, and their stock was released.

**Security:** Brand B's token gets **403** on `PUT /products/update/30` and `DELETE /products/delete/30` (Brand A's product). A customer opening `/dashboard/vendor` or `/dashboard/admin` is redirected to login.

## Fixed (local, uncommitted)

Each fix followed the same steps: failing test first (red), then the fix, then the passing test (green). The final state:
- `pnpm run test:run`: **42 files / 345 tests passed**
- `pnpm run build`: **exit 0**

| Sev | Bug (production) | Fix | Test (red → green) |
|---|---|---|---|
| HIGH | Brands can't create men's or women's products: the wizard sends `MALE`/`FEMALE`, and the backend returns 400 (`MEN`/`WOMEN`) | `vendor/.../products/constants.ts`, admin `Products.tsx` editor; review step shows the German label | `constants.test.ts`: `['FEMALE','MALE','UNISEX']` ≠ expected → 2 ✓ |
| HIGH | Brands can't create any discount code: `POST /brand/discounts` returns 400 "Unknown field: active" | `discountsApi.brand.create` stops sending `active`; an inactive code is switched off with a follow-up `update` | `discountsApi.test.ts`: 2 ✗ → 2 ✓ |
| HIGH | Brand fulfilment view, admin orders and both confirmation pages showed the address **without the house number and supplement** (confirmation pages also without the name), so brands would ship to "Marienplatz", not "Marienplatz 1" | new `lib/orderAddress.ts` `shippingAddressLines`, used in all 5 places; `houseNumber`/`addressLine2` added to the type | `orderAddress.test.ts` (fixture = real `GET /orders/27`): ✗ → 4 ✓ |
| HIGH | The admin product search crashes the admin page on the first keystroke (`p.sku.toLowerCase`; admin products have no SKU) | `lib/adminProductSearch.ts` | 7 ✓ (module missing → green) |
| HIGH | New products never appear on `/bekleidung/streetwear` (and the other catalogue landing pages): they were prerendered once at deploy | `export const revalidate = 60` on 5 pages | build output now shows "Revalidate 1m" for all 5 |
| MEDIUM | Homepage "Neue Arrivals" only sorted the first 8 API results, so new products were missing. **User request:** max 4 items in "Unsere Favoriten" and "Neue Arrivals" | API sort `createdAt,desc` (after review); both sections limited to 4; `/neu` uses `byNewest` | `newestProducts.test.ts` 3 ✓ |
| MEDIUM | A colour card with no own photo showed **another colour's** photo (P2 GREEN → BLUE) | `apiProductToColourwayCards` falls back to the primary shared image | `productAdapter.test.ts`: `'blue.jpg'` ≠ `'shared.jpg'` → ✓ |
| MEDIUM | An invalid Gutscheincode stays in the order after the field is cleared, so payment is blocked; the error text was raw English | clearing the field drops the code; `couponErrorMessage` (German) | `errorCopy.test.ts` 2 ✗ → ✓ |
| MEDIUM | The look picker shows saved picks as unselected, and a click saves duplicates (`[24,8,24]`): string vs number ids | `isLookSelected` / `toggleLookSelection` compare as strings | `LookPicker.test.ts`: `['24','8',24]` → ✓ |
| MEDIUM | Brand settings accept VAT id `DE12` and return postcode `ABC`; an "@marke" handle (the field's own placeholder) gets a 400 | `lib/brandSettingsValidation.ts`, used in `Settings.tsx` | 7 ✓ |
| MEDIUM | Closed cart/menu/search/colour panels stay in the Tab order (about 34 invisible controls) | `inert` while closed | localhost check V10 |
| MEDIUM | Colour swatches, brand link and SKU copy button have no visible keyboard focus | purple `focus-visible` outline | localhost check V10 |
| LOW | Homepage card: BLACK photo + RED swatch + link opens RED; no struck-through price | `apiProductToCoverCard`; `originalPrice` passed through | 3 ✓ |
| LOW | `/neu` and catalogue: the "Neuheiten" sort did nothing | sort newest-first | via `newestProducts` |
| LOW | Saved favourite drops the colour (`?color=`) | `ProductDetails.tsx` | localhost check V6 |
| LOW | Confirmation page: no quantity, lines don't add up (×2 shown as one price) | shows ×n and the line total | localhost check V9 |
| LOW | Checkout amounts in English format (`€69.95`) | `formatEuro` (de-DE), as in the cart | localhost check V8 |
| LOW | Cart sidebar Wunschliste tab hardcoded to 0, and always "Noch nichts gemerkt" | real count + link to `/saved-lists` | localhost check V7 |
| LOW | Wizard accepts 31 return days and duplicate variant rows | `lib/productWizardValidation.ts` | 5 ✓ |
| LOW | Brand status "Versandt" after the return was received; the "Rückgabe" tab goes empty after approval | `brandOrderStatus` + `isReturnStatus` | `brandRevenue.test.ts`: `'SHIPPED'` ≠ `'RETURN_RECEIVED'` → ✓ |
| LOW | Admin price column shows € 0,00 (the admin DTO has no price) | shows "—" | none (display only) |

## Localhost verification (4 Oct 2026)

`localhost:3000` dev server against the production API, in separate isolated browser contexts. Admin checks were not possible on localhost, because nobody logs in as admin there. The admin fixes are covered by unit tests and the build.

| # | Check | Result |
|---|---|---|
| V1 | Homepage: 4 cards each in "Unsere Favoriten" and "Neue Arrivals"; Neue Arrivals newest first | PASS (P3, P2, P1, Drift Trousers; rechecked after the review change to the API sort) |
| V2 | Homepage P1 card: swatch = photo colour, `?color=`, struck-through price | PASS (BLACK-2 photo, BLACK first, `?color=BLACK`, 69,95€ / ~~89,95€~~) |
| V3 | `/neu` newest first | PASS (rechecked with `byNewest`) |
| V4 | P2 GREEN colour card shows the shared image | PASS |
| V5 | Streetwear shows P1 + P3; athleisure shows P2 | PASS |
| V6 | Favourite keeps the colour | PASS (`?color=WHITE`); rechecked: the wishlist card now also leads with the WHITE swatch |
| V7 | Cart sidebar Wunschliste count + link | PASS ("Wunschliste 2") |
| V8 | Invalid code → German message; clearing removes the code from the preview; German amounts | PASS |
| V9 | Confirmation: full address, ×2, line totals add up | PASS (rechecked with `itemGross`: 69,95 € + 139,90 € + 39,95 € + 59,95 € = 309,75 €) |
| V10 | Closed panels out of the Tab order; visible focus ring | FAIL first (Tailwind v4: `focus:outline-none` overrode the ring) → fixed → **PASS** (swatch, SKU button and brand link: `solid 2px rgb(55,14,77)` under keyboard focus) |
| V11 | Wizard: "Herren" creates the product (201, gender MEN); 31 days and duplicate rows rejected | PASS (test product 33 deleted afterwards) |
| V12 | Look picker shows saved picks; no duplicates | PASS |
| V13 | VAT `DE12` / PLZ `ABC` rejected; `@e2etest` → `e2etest` | PASS (restored) |
| V14 | Brand creates discount code E2E0930; discount only on Brand A items | PASS (−6,99 € = 10 % of P1 only; code deactivated afterwards, since there's no delete) |
| V15 | Bestellungen: address with house number; "Rückgabe" tab; status after return | PASS (rechecked after the review change: tab lists exactly the 3 orders in RETURN_RECEIVED) |

Not checked in the browser: the "T SHIRT" label on the wizard review step, which uses the same `productTypeLabel` as the dropdown.

## Code review (thermo-nuclear) and resulting changes

The review of the fix diff found one real bug and several symptom-level patches. All have been fixed:

1. **Bug:** `Settings.tsx` stripped the letter "s" instead of whitespace from VAT ids (`/s+/`, a lost backslash). Now there is one `normalizeVatId` used by both the check and the save, with a test that includes "SE…".
2. **"Neue Arrivals" uses the API sort:** `GET /products?sort=createdAt,desc` (verified live) instead of loading 100 products and sorting locally, which would have hit the same bug again once there are more than 100 products. `ProductSearchParams.sort` added.
3. **`byNewest` comparator** instead of `newestProducts(r, r.length)`, the same pattern as the price and name sorts.
4. **Fulfilment tabs:** `fulfilmentTab(status)` instead of a special-case branch in the filter; the tab id is now an honest `RETURN`. `brandOrderStatus` reuses `isReturnStatus`.
5. **Confirmation page** uses the canonical `itemGross` (prefers the backend's `lineTotal`) and `formatEuro` instead of its own `fmt`. `/checkout/bestaetigung` also uses `formatEuro` now ("€69,95" → "69,95 €").
6. **Smaller items:**
   - `colourHref` and `withColourFirst` in `lib/product.ts` replace three hand-built copies each.
   - Index keys for the address lines.
   - `productTypeLabel` covers all underscores ("T_SHIRT" → "T SHIRT").
   - "Abbrechen" clears validation errors in Settings.

Final state: **42 files / 345 tests passed**, `pnpm run build` exit 0, ESLint on all changed files 0 errors (the remaining warnings were already there).

**Recommendations, not implemented:**
- Normalize product ids once in the `brandApi` adapter, instead of `String(id)` in `LookPicker`.
- Make `AdminApiProduct.price` honestly optional, or remove the admin price column.
- `discountsApi.brand.create` takes two steps (create, then `update(active:false)`) until the backend accepts `active` on create.
- `OrderDetails` exists twice (confirmation page and `/checkout/bestaetigung`) and should be merged.

## Backend: cannot be fixed from this repo

| Sev | Issue | Evidence |
|---|---|---|
| HIGH (risk) | Admin "delivered" uses the **deprecated** `PATCH /admin/orders/{id}/status`, which CLAUDE.md says is removed next release, and there is no replacement endpoint for DELIVERED | `lib/api/modules/adminApi.ts:118` |
| MEDIUM | Returns can't be partial: `ReturnRequestDto` has no quantity, so 1 of 2 can only be returned as the whole line (the admin entered a partial refund amount instead) | RET-2026-1FVC6C |
| MEDIUM | Admin settlement shows 607,24 € due to brand 5, but the brand payouts show 0,00 €; `POST /admin/payouts/generate` returns `[]` | state file, Phase E |
| MEDIUM | Mollie Failed/Canceled sends the customer back to Mollie's method page, not to the shop; the order stays PENDING until the 30-min auto-cancel; a retry creates a second PENDING order | ENS-2026-FPRD0G / TK3E1I |
| LOW | `AdminProductResponseDto` has no price and no SKU; the create response has `colors[]` empty | |
| LOW | Phone number not stored on saved addresses (the address-book DTO has no phone) | |
| LOW | Customer order items carry no `brandName`, so the account order detail can't group items by brand | `GET /orders/27` |
| INFO | No image is set as primary automatically after upload | |

## Needs your decision (not changed)

1. **Approval copy vs behaviour.** The wizard says the product "wird zur Überprüfung eingereicht und muss genehmigt werden" (is submitted for review and must be approved), but the backend creates it **ACTIVE** immediately. Which is right: auto-publish (fix the copy) or moderation (backend)?
2. **PDP zoom/favourite buttons under the fixed header** after a little scrolling. Fixing it is a layout choice: a sticky gallery below the header, or pinned buttons.
3. **Netto/Brutto switch clears both prices** in the listing editor. The code says this is intentional. Should it convert instead?
4. **Brand bio/website/socials** are editable in Settings ("erscheint auf deiner öffentlichen Markenseite", i.e. "appears on your public brand page") but never shown on `/marken/<brand>`. This is a feature gap.
5. `/marken/<anything>` renders an empty brand page instead of 404, and `/bekleidung/catalogue` redirects to such a page.

## Still open (frontend, LOW, not fixed)

- `/account` briefly shows the logged-in dashboard ("Abmelden", 0 orders) to guests before the login form appears (seen on localhost, 4 Oct).

- `/cart` "−" at quantity 1 removes the line; the sidebar disables it instead (inconsistent).
- "Problem melden" gives no confirmation toast, and the list doesn't refresh.
- Variant and listing delete have no confirm dialog.
- Admin KUNDE column is empty.
- "Offene Punkte" lists the 3 oldest orders.
- Header icons are 20×20 px; gallery dots are 6–10 px (tap targets).
- No arrow-key navigation in the gallery or zoom.
- Icon-only buttons in the vendor rows have no accessible names.
- Faint default focus ring elsewhere.
- Analytics, Marketing and the Abrechnung chart show mock data (marked "bald").
- Hero and Subscribe autoplay videos ignore `prefers-reduced-motion`.
- The vendor dashboard calls brand endpoints with a customer token before redirecting (all 403, no data leaked).

## Emails to verify (your inbox)

See `e2e/reports/2026-09-30-state.md` → "Emails to verify" for the full list with expected products and colour images. The key ones:
- **Paid orders:** order confirmation for ENS-2026-1TWSCJ (4 lines; P2 GREEN must show the *shared* image, not BLUE) and ENS-2026-1PV2Y8.
- **New-order notifications:** to Brand A and Brand B, each with only its own lines.
- **ENS-2026-1TWSCJ, after the order:** shipped (two parcels, UPS 1Z999AA10123456784 / …785), delivered, and RET-2026-1FVC6C requested → approved → received → refunded 69,95 €.
- **ENS-2026-1PV2Y8:** shipping problem report, then cancellation + refund 44,95 €.
- **No** "paid" email for ENS-2026-FPRD0G or ENS-2026-TK3E1I.

## Test data left on production

- **Products:** P1 `E2E-0930 Colour Hoodie` (id 30), P2 `E2E-0930 Fallback Tee` (31), P3 `E2E-0930 Brand B Trouser` (32). All are ACTIVE, with stock restored.
- **Orders:** 27–30.
- **Address:** saved address id 7 (Erika Mustermann) on the test customer.
- All brand settings and listing/variant edits were reverted.
