# "Coming Soon" Preview Product State — Design Spec

**Date:** 2026-09-08
**Status:** Draft — awaiting review
**Scope:** Frontend only (`C:\dev\enunas`). The backend `preview` contract (§2) is reported as already implemented, tested, and green in a separate session; this spec treats it as the source of truth to build against and to verify, not to build.

## 1. Problem

A product today has exactly two price states, both derived purely from data (no status enum):

- **Regular** — `originalPrice == null`
- **Sale** — `originalPrice != null` (a strike-through pre-discount price)

Brands want a third, pre-release state: publish a product ahead of its drop so customers can see it is coming, without it being buyable and without revealing the price. The vendor product form already has a **"Release-Datum"** field (`app/(dashboard)/dashboard/vendor/_components/Products.tsx:1482`) wired to `releaseDate`, sent to the backend on create/update and returned on every product response — but nothing in the storefront currently reads it.

## 2. Backend contract (source of truth — reported as already implemented; verify, don't build)

Every product response now carries a boolean **`preview`**. It appears on:

- `ProductResponseDto` — all 7 storefront endpoints: `GET /products`, `/products/slug/{slug}`, `/products/{id}`, `/products/sku/{sku}`, `/products/search`, `/products/category/{c}`, `/products/color-family/{c}`
- `AdminProductResponseDto`

For a product with `preview: true`:

| Field | Value |
|---|---|
| `preview` | `true` |
| `price` | `null` |
| `originalPrice` | `null` |
| `releaseDate` | `"YYYY-MM-DD"` — a future date |
| `variants`, `images`, `videos` | fully populated — render the product visually as normal |

- `GET /products/{id}/listings` → `[]` for a preview product; `GET /listings/{id}` → `404`. Not an error — do not call them for a preview product, and do not treat the empty result as a failure.
- **Not purchasable.** `POST /orders` with one of its listings → `409` with `{ "message": "Product … is not yet released (releases YYYY-MM-DD)" }`.
- **Auto-transition.** The product flips to live automatically at **UTC midnight** of `releaseDate` (≈ 02:00 Europe/Berlin in CEST). Computed server-side at read time — no job, no manual "activate". After the flip the same endpoints return `preview: false`, a real `price`, and populated listings.
- Preview products are **mixed into the normal feeds** — no separate endpoint, no query param. The backend returns them in the caller's chosen `Pageable` sort, preview items interleaved.

**Frontend detection signal: `preview === true`.** `releaseDate` is used only for display text and as the countdown target. Never infer "coming soon" from `releaseDate` alone or from `price == null`.

### 2.1 Timezone decision (locked)

The backend gate flips at **UTC midnight** of `releaseDate`, matching the `CURRENT_TIMESTAMP` checks beside it. The frontend countdown therefore targets `Date.UTC(y, m-1, d)` — **not** Berlin midnight. A countdown to Berlin midnight would hit zero while the API still returns `preview: true` for ~2 hours, producing a visible "timer says available, page still says coming soon" bug. The UI never flips itself on the timer alone: reaching zero triggers a re-fetch that *confirms* the transition (§6).

## 3. Types & adapters

| File | Change |
|---|---|
| `types/api.ts` | Add `preview?: boolean` to `RawProductResponse`, `ApiProduct`, and `AdminApiProduct`. (`AdminApiProduct` extends `Omit<ApiProduct, …>` so it inherits it, but document it.) |
| `lib/api/productResponseAdapter.ts` | `adaptProduct()` carries `preview: raw.preview ?? false`. `available` stays `raw.price != null` (already `false` for preview). `price` keeps its `?? 0` fallback. `originalPrice` stays `?? null`. |
| `lib/api/productAdapter.ts` | `ProductCardShape` gains `preview: boolean` and `releaseDate: string \| null`. `apiProductToCardShape()` sets `preview: p.preview ?? false`, `releaseDate: p.releaseDate ?? null`, and when `preview` forces `price: ''` and `originalPrice: null` (there is no price to format). |

`ProductCardShape.price` stays typed `string` (not nullable) to avoid churn across ~15 call sites; `''` is the preview sentinel and the card treats `preview` as authoritative anyway (§5). `FilterSidebar.parsePriceNum('')` → `NaN`, which is harmless because preview items are always partitioned out of any price sort (§7).

## 4. Feed gate — `sellableOnly()` (`lib/api/modules/productApi.ts`)

**This is the load-bearing change.** Today `sellableOnly()` drops every product with `available === false`, so a preview product (`price: null` → `available: false`) never reaches any grid fed by `productApi.list()` or `productApi.search()`.

Change the keep condition:

```
content.filter(p => p.available || p.preview)
```

Non-preview unavailable products stay filtered exactly as now. `totalElements` accounting unchanged in shape (still subtract the count actually removed). `resolveProductBySlug` / the PDP path does **not** use `sellableOnly` and already lets preview products through — no change there.

## 5. Product card — `app/Homepage/components/PopularProductCard.tsx`

New props: `preview?: boolean`, `releaseDate?: string | null`. Threaded from `ProductCardShape` at every call site that spreads `{...p}` (most already do). Call sites that pass props explicitly (`NewProducts`, `PopularProduct`, `RecRow`, `RelatedProducts`, `StyleSuggestions`, `WishlistPreview`) get the two new props added.

When `preview` is true:

- **Image chip:** a small chip, top-left on the image — `COMING SOON`, League Spartan, uppercase, `tracking-[0.15em]`, ~`text-[9px]`, `bg-enunas-purple text-white` padding `4px 10px`. Mirrors the drop page's status-chip placement (`DropsPageContent.tsx`), Enunas-purple instead of translucent white.
- **`new in` label:** suppressed for preview cards (`isNewProduct(createdAt)` is ignored when `preview`).
- **Price line → date badge:** where the price normally renders, show `Kommt am {formatReleaseDateShort(releaseDate)}` (e.g. `Kommt am 1. Oktober`) — `text-enunas-purple`, same size/weight as the current price line. No number, no blur (there is no price).
- **Hover content → countdown:** the card already crossfades the default info block to sizes/categories on hover. For a preview card, the hover block renders `<ComingSoonCountdown variant="card" releaseDate={releaseDate} />` instead of the sizes/categories. Touch devices (no hover, `canHover === false`) simply keep the date badge — acceptable, the PDP has the full countdown.
- **Link:** unchanged — the card still links to the PDP.
- **Wishlist heart:** unchanged, still works. The saved `WishlistItem` carries `price: null` and the two new fields (§8).

## 6. PDP — `app/(root)/bekleidung/[brand]/[slug]/`

### `page.tsx`

- Pass `preview={resolved.preview ?? false}` to `<ProductDetails>`.
- `toNewProduct()` already carries `releaseDate` onto the `PdpProduct` — no change.
- `toRecItem()` / recommendation mapping: a preview product used as a recommendation renders `price: null` already (it checks `p.available`); additionally carry `preview`/`releaseDate` into `RecItem` so the rec card shows the coming-soon treatment (see `RecItem` in `components/ProductCard.tsx`).

### `components/ProductDetails.tsx`

New prop `preview: boolean`. When true:

- **Listings fetch:** skip the `useEffect` that calls `productApi.getListings(productId)` entirely (backend returns `[]`). `listings` stays `[]`, `listingsLoading` false, `listingsFailed` false — so none of the "Verfügbarkeit konnte nicht geladen werden" / variant-unavailable logic engages.
- **Price block (section 5 of the component):** replace the `formattedPrice` + strike-through + "Reduziert −X %" UI with:
  - `Kommt am {formatReleaseDate(releaseDate)}` (e.g. `Kommt am 1. Oktober 2026`) — Cormorant, matching the collection-line styling already there.
  - `<ComingSoonCountdown variant="pdp" releaseDate={releaseDate} onElapsed={handleReleaseElapsed} />` in Enunas purple.
- **CTA button:** keep the existing button chrome but `disabled`, `opacity-60`, label `COMING SOON`. `handleCta` returns early when `preview`. No size modal.
- **Colour / size selectors:** still rendered (customer can see what is coming) but a selection never enables add-to-cart — `handleAddToCart` / `handleCta` are no-ops under `preview`.
- **`StickyAddToCart`:** receives the disabled `COMING SOON` label and `isOutOfStock` (its disable flag) forced true.
- **Wishlist:** unchanged; saved item carries `price: null`, `preview: true`, `releaseDate`.

### Live transition while the page is open

`ProductDetails` is already a client component. Add:

- A `visibilitychange` + `window.focus` listener, active only while `preview` is true.
- On fire, if `Date.now() >= Date.UTC(...releaseDate...)`, call `productApi.getBySlug(productSlug)` once.
- If the refetched product returns `preview === false`: update local state (`price`, `originalPrice`, `preview`, and re-enable the listings fetch) so the PDP becomes the normal buyable UI in place — no full navigation.
- Optional: a small transient toast `Jetzt verfügbar` on that transition.
- No polling. `onElapsed` from the countdown does the same focus-independent check once, then relies on the listener.

## 7. Feed placement

Confirmed rules:

| Surface | Preview products shown? | Ordering |
|---|---|---|
| `/bekleidung` catalogue grid (`CatalogueContent.tsx`, `bekleidung/page.tsx`) | Yes | live first, then preview |
| Category pages, `/products/search` results | Yes | live first, then preview |
| `/marken/[brand]` (`FeedPageContent` with `brandFilter`) | Yes | live first, then preview |
| `/catalogue` recommendations (`CuratedRecommendations` default) | Yes | live first, then preview |
| PDP recommendation rows (`CompleteTheLook`, `MoreFromBrand`, `SimilarProducts`, `CuratedRecommendations`) | Yes | live first, then preview |
| **`/neu`** | Only if `releaseDate − now ≤ 7 days` | live first, then preview |
| **`/trendy`** | **Excluded entirely** | — |
| **Homepage** — `PopularProduct` ("Unsere Favoriten"), `NewProducts` ("Neue Arrivals"), homepage `CuratedRecommendations variant="feed"` | **Excluded entirely** | — |
| Cart similar, wishlist preview, `/saved-lists` | Render whatever is passed; a saved preview item shows the coming-soon card state (§8) | as given |

Rationale for excluding the homepage: there is no guarantee of enough concurrent drops to populate those sections cleanly; the homepage stays purely live product.

### Implementation

- New module `lib/preview.ts`:
  - `isWithinDays(releaseDate: string, days: number, now = Date.now()): boolean` — `Date.UTC` based.
  - `partitionPreview<T extends { preview?: boolean; releaseDate?: string | null }>(items: T[], mode: 'show' | 'window7' | 'hide'): T[]`
    - `hide` → drop every `preview` item.
    - `window7` → drop `preview` items where `!isWithinDays(releaseDate, 7)`; keep the rest.
    - `show` → keep all.
    - In every mode, return `[...liveInGivenOrder, ...previewInGivenOrder]` — preview items always sink below live items regardless of the caller's sort (they have no price/date to sort by).
- `FeedPageContent` gets a prop `previewMode: 'show' | 'window7' | 'hide'` (default `'show'`). Applied to `visibleProducts` after the existing sort. `NeuPageContent` passes `'window7'`; `TrendyPageContent` passes `'hide'`; `/bekleidung` and `/marken` callers pass `'show'` (or omit).
- `NewProducts`, `PopularProduct`: apply `partitionPreview(list, 'hide')` before mapping to cards.
- `CuratedRecommendations`: new prop `previewMode` (default `'show'`); homepage usage (`app/(root)/page.tsx`) passes `'hide'`. `resolveCuratedOrNewest` may return preview products (a curated id that went preview, or the newest-fallback) — filtering happens in the component, not the resolver.
- `CatalogueContent` / `bekleidung/page.tsx`: apply `partitionPreview(list, 'show')` so preview items land after live ones.

## 8. Wishlist / saved lists

`WishlistItem` (`app/context/WishlistContext.tsx`) gains `preview?: boolean` and `releaseDate?: string | null`. Both `PopularProductCard.handleToggleSaved` and `ProductDetails.handleToggleSaved` populate them. Persisted to the same localStorage entry. `/saved-lists` and `WishlistPreview` spread `{...item}` into `PopularProductCard`, so a saved preview product renders the coming-soon state automatically. Older saved entries without the fields degrade to a normal (no-price) card — acceptable.

## 9. Checkout safety net — `app/(root)/checkout/page.tsx`

A preview product cannot normally reach the cart (the PDP never offers add-to-cart). Race guard only: in the `catch (err)` of `orderApi.create(...)`, if `err instanceof FetchError && err.status === 409` and `/not yet released/i.test(err.message)`:

- Set the error banner to `Ein Artikel in deinem Warenkorb ist noch nicht erhältlich und wurde entfernt.`
- Remove the matching line(s) from the cart (best-effort match by product name from the message, or clear-and-let-user-rebuild if the name can't be parsed).

No change to `CartContext`.

## 10. Admin — `app/(dashboard)/dashboard/admin/_components/Products.tsx`

- `AdminApiProduct` already inherits `preview` (§3).
- Render a small `Vorschau` badge next to `<StatusBadge status={p.status} />` (`Products.tsx:500`) when `p.preview`. Reuse the `StatusBadge` visual language or a plain purple pill.
- No new filter tab, no new column. Vendor dashboard: out of scope for this change (the "Release-Datum" field already exists; surfacing a per-row "Vorschau" hint there is a natural follow-up).

## 11. New shared component — `components/ComingSoonCountdown.tsx`

```
interface Props {
  releaseDate: string            // "YYYY-MM-DD"
  variant: 'card' | 'pdp'
  onElapsed?: () => void
}
```

- Target: `Date.UTC(year, month - 1, day)` parsed from `releaseDate`.
- `useState` + `useEffect` 1-second `setInterval`, cleared on unmount. Recompute `d/h/m/s` from `max(0, target - Date.now())` (same math as `getCountdown()` in `DropsPageContent.tsx`).
- **SSR / hydration:** render a static `Kommt am {formatReleaseDate}` (no digits) until `mounted` flips true in an effect, then swap to the ticking display. Prevents a server/client digit mismatch.
- **Display:** `DD : HH : MM : SS` with small `d / h / m / s` labels under each, Cormorant Garamond numerals, colour `--enunas-purple` (`#370E4D`), `:` separators in `--enunas-gray-light`. `card` variant: single compact row, ~`text-lg` digits. `pdp` variant: larger, ~`text-3xl` digits, centered to match the PDP column.
- On `diff` reaching 0: call `onElapsed?.()` once (guard with a ref), then keep rendering `00:00:00:00` until the parent unmounts/replaces it. The component never flips any surrounding UI itself.
- `prefers-reduced-motion`: still ticks (it is text, not motion) but that is acceptable; no animated transitions on the digits.

## 12. Date formatting — `lib/preview.ts` (or `lib/product.ts`)

```
formatReleaseDate(iso: string): string       // "1. Oktober 2026"  — Intl.DateTimeFormat('de-DE', { day:'numeric', month:'long', year:'numeric' })
formatReleaseDateShort(iso: string): string  // "1. Oktober"        — same, without year
```

Both parse `iso` as a plain date (`new Date(iso + 'T00:00:00Z')`) and format in `de-DE`.

## 13. Tests

| File | Cases |
|---|---|
| `lib/api/productResponseAdapter.test.ts` | `preview: true` in raw → `preview: true`, `available: false`, `price: 0`, `originalPrice: null` carried. `preview` absent → `false`. |
| `lib/api/modules/productApi.test.ts` (or new) | `sellableOnly` keeps a `preview` product; still drops a non-preview `available: false` product; `totalElements` decremented by the count actually removed. |
| `lib/preview.test.ts` (new) | `isWithinDays` boundary (exactly 7 days, 7 days + 1 min). `partitionPreview`: `hide` drops all preview; `window7` drops far-out preview, keeps near ones; `show` keeps all; every mode returns live-before-preview and preserves relative order within each group. |
| `components/ComingSoonCountdown` (new) | Target = UTC midnight of `releaseDate`. `onElapsed` fires once when target passes. Static fallback before mount. |

## 14. Out of scope

- Backend implementation of `preview` (§2) — reported done elsewhere; this spec only consumes and verifies it.
- Vendor dashboard per-row "Vorschau" indicator — natural follow-up, not touched.
- Any "blur the price" treatment — there is no price in the API for a preview product (`price: null`); the design uses placeholder text instead. This was raised and settled when Option B was chosen.
- A dedicated `/drop`-style teaser page for products with no product row at all — different feature, needs its own data source.
- Non-`de-DE` date/locale handling — the store is German-only today.
- Scheduled/precise drop *time* (a `releaseAt` datetime) — the contract is date-only; drops land at UTC midnight.

## 15. File-change summary

**New:**
- `components/ComingSoonCountdown.tsx`
- `lib/preview.ts` + `lib/preview.test.ts`

**Modified:**
- `types/api.ts` — `preview` on 3 interfaces
- `lib/api/productResponseAdapter.ts` — carry `preview`
- `lib/api/productAdapter.ts` — `ProductCardShape` + `apiProductToCardShape`
- `lib/api/modules/productApi.ts` — `sellableOnly` keep condition (+ test)
- `lib/curation.ts` — none required (filtering in component), confirm
- `app/Homepage/components/PopularProductCard.tsx` — preview card state
- `app/Homepage/components/NewProducts.tsx`, `PopularProduct.tsx` — `partitionPreview(_, 'hide')`
- `components/CuratedRecommendations.tsx` — `previewMode` prop
- `app/(root)/page.tsx` — pass `previewMode="hide"`
- `app/(root)/bekleidung/components/FeedPageContent.tsx` — `previewMode` prop
- `app/(root)/neu/components/NeuPageContent.tsx` — pass `'window7'`
- `app/(root)/trendy/components/TrendyPageContent.tsx` — pass `'hide'`
- `app/(root)/bekleidung/components/CatalogueContent.tsx`, `app/(root)/bekleidung/page.tsx` — `partitionPreview(_, 'show')`
- `app/(root)/bekleidung/[brand]/[slug]/page.tsx` — pass `preview`, carry into `RecItem`
- `app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx` — preview PDP state + live transition
- `app/(root)/bekleidung/[brand]/[slug]/components/ProductCard.tsx` (`RecItem` card) + `RecRow.tsx` / `RelatedProducts.tsx` / `StyleSuggestions.tsx` — pass new props
- `app/(root)/bekleidung/[brand]/[slug]/components/StickyAddToCart.tsx` — accept disabled coming-soon label (may need no change if already generic)
- `app/context/WishlistContext.tsx` — `preview`/`releaseDate` on `WishlistItem`
- `app/(root)/checkout/page.tsx` — 409 safety net
- `app/(dashboard)/dashboard/admin/_components/Products.tsx` — `Vorschau` badge
- `lib/api/productResponseAdapter.test.ts` — preview cases

## 16. Verification checklist (before "done")

- [ ] `pnpm run build` passes (CLAUDE.md hard constraint).
- [ ] A backend product with `preview: true` appears on: catalogue grid, category page, search, `/neu` (if ≤7d), `/marken/[brand]`, its own PDP.
- [ ] The same product does **not** appear on: `/trendy`, homepage sections, `/neu` (if >7d).
- [ ] PDP shows purple countdown + `Kommt am …` + disabled `COMING SOON`; no price, no add-to-cart, no listings error.
- [ ] Card shows purple `COMING SOON` chip + `Kommt am …`; countdown on hover; still links to PDP.
- [ ] Countdown digits match a UTC-midnight target (spot-check against `releaseDate`).
- [ ] Visual confirmation via chrome-devtools MCP against a real preview product (per project memory `feedback_verify_with_chrome_devtools_mcp`).
- [ ] Admin product list shows `Vorschau` badge for the preview product.
