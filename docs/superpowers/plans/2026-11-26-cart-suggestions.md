# Cart Suggestions and Favourites Rows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show favourites with pictures and style-matched Schaufenster picks in the cart drawer, both addable there.

**Architecture:** Pure logic in `lib/` (style ranking, cached loading, cart-line building). One hook loads curation plus one product list for both tabs. A shared row component renders suggestions and favourites inside `.enu-cart-body`.

**Tech Stack:** Next.js 16, React, TypeScript, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-26-cart-suggestions-design.md`

## Global Constraints

- `.enu-summary` markup and CSS stay untouched. `/cart` and existing add paths stay untouched.
- On open: `storefrontApi.getCuration()` once and `productApi.list({ size: 100 })` once, reused 5 minutes (`300_000` ms). Nothing while closed, or when cart and favourites are both empty. No per-product display requests; one `productApi.getListings(id)` per "Hinzufügen" product.
- Copy: "Das könnte dir gefallen", "+ Hinzufügen", "Ausverkauft", "Coming Soon", "Wunschliste ansehen".
- Max 3 suggestions, from one style only.
- Enunas colours and fonts, `var(--ease)` / `var(--ease-q)`, animate only transform/opacity, reduced motion, 390px width, visible focus.
- The working tree holds unrelated uncommitted work. Do not commit, stash or revert; the user has not asked for commits.
- Test first; never edit a test to make it pass.

## Review Focus

1. Logged-out shopper taps "Hinzufügen" and listings answers 401: nothing is added, the row says "Zum Hinzufügen bitte anmelden" and links to `/account`. (Task 3)
2. Cart already holds all available stock of that favourite: the row says "Maximale Menge im Warenkorb" instead of silently doing nothing. (Task 3)
3. Same piece added from the product page and the drawer: one line with quantity 2, not two lines. (Task 3)
4. Switching tabs or reopening while loading: no second request. (Task 2)
5. Double tap on a size while listings are pending: one request, one add. (Task 4, live check)

---

### Task 1: Style ranking and picks

**Files:** Create `lib/cartSuggestions.ts`, `lib/cartSuggestions.test.ts`

**Interfaces:**
- Consumes: `productSegments` from `lib/product.ts`; `ApiProduct`, `CurationData`, `Segment` from `types/api`.
- Produces:
  - `rankCartStyles(lines: { productId: string; quantity: number }[], products: ApiProduct[]): Segment[]`
  - `isSoldOut(p: ApiProduct): boolean` (has variants and all have `stockQuantity === 0`)
  - `pickSuggestions(lines, products: ApiProduct[], curation: CurationData | null): ApiProduct[]`

- [ ] **Step 1: Write the failing tests**, comparing ids as strings:
  - "weights by quantity": one cultural line qty 1, one athleisure line qty 2 → `['athleisure','cultural']`.
  - "counts both styles of a two-style product", and `culture` counts as `cultural`.
  - "breaks a tie by the last cart line": streetwear then athleisure, qty 1 each → athleisure first.
  - "ignores cart products not in the list and unknown styles" → `[]`.
  - "returns at most 3 in Schaufenster order": 5 curated ids → first 3 in that order.
  - "skips in-cart, sold-out, unavailable, preview and unlisted picks".
  - "falls back to the next style without mixing": top style has no eligible pick → only second-style ids.
  - "returns [] for empty cart, null curation, or nothing eligible".
- [ ] **Step 2:** `pnpm run test:run lib/cartSuggestions.test.ts` → FAIL.
- [ ] **Step 3:** Implement. Array order of `lines` is recency (last = newest). Compare ids via `String()`.
- [ ] **Step 4:** Same command → PASS.

### Task 2: Cached shelf loading

**Files:** Create `lib/cartShelf.ts`, `lib/cartShelf.test.ts`

**Interfaces:**
- Produces:
  - `interface CartShelf { products: ApiProduct[]; curation: CurationData | null }`
  - `createCartShelfLoader(deps: { listProducts: () => Promise<ApiProduct[]>; getCuration: () => Promise<CurationData>; now?: () => number; ttlMs?: number }): () => Promise<CartShelf>`

- [ ] **Step 1: Write the failing tests** with `vi.fn()` deps and a controllable `now`:
  - "concurrent calls share one load": two calls before resolution → each dep called once.
  - "reuses for 5 minutes, reloads after": at 299_999 ms once; at 300_000 ms twice.
  - "does not cache a failed product load": call rejects; next call calls again.
  - "curation failure still returns products, uncached": `curation: null`; next call calls again.
- [ ] **Step 2:** `pnpm run test:run lib/cartShelf.test.ts` → FAIL.
- [ ] **Step 3:** Implement; cache the promise, `ttlMs` default `300_000`, run both deps in parallel.
- [ ] **Step 4:** Same command → PASS.

### Task 3: Quick-add logic

**Files:** Create `lib/quickAdd.ts`, `lib/quickAdd.test.ts`

**Interfaces:**
- Consumes: `colourwayCoverImage` (`lib/colourwayImage.ts`), `isSizeUnavailable` (`lib/sizeAvailability.ts`), `generateSlug` (`lib/product.ts`), `FetchError`, `CartItem`, `ApiListing`.
- Produces:
  - `variantColours(p: ApiProduct): string[]`: distinct colour names, first-seen variant order.
  - `sizeChoices(p: ApiProduct, colour: string): { size: string; unavailable: boolean }[]`
  - `buildCartLine(p: ApiProduct, colour: string, size: string, listings: ApiListing[]): Omit<CartItem,'id'|'quantity'> | null`
  - `type QuickAddResult = { status: 'added' } | { status: 'login' } | { status: 'atLimit' } | { status: 'failed' }`
  - `quickAdd(args: { product: ApiProduct; colour: string; size: string; cartItems: CartItem[]; getListings: (id: string) => Promise<ApiListing[]>; addToCart: (line: Omit<CartItem,'id'|'quantity'>) => void }): Promise<QuickAddResult>`

- [ ] **Step 1: Write the failing tests:**
  - "disables zero-stock and missing sizes".
  - "builds the same line as the product page": `price = product.price`; `color.id = String(variantColours(p).indexOf(colour))` (the product page ids colours by index); `color.name`; `defaultListingId` from the listing matching `variantColor` and `variantSize`; `stockQuantity` from the variant; `image` from `colourwayCoverImage`; `productPath = /bekleidung/${generateSlug(brandName)}/${slug}`.
  - "returns null without a matching listing" → `quickAdd` gives `failed`, no add.
  - "401 gives login, other errors give failed", `addToCart` not called.
  - "at stock limit gives atLimit": matching line (productId, size, color.id) with `quantity >= stockQuantity`.
- [ ] **Step 2:** `pnpm run test:run lib/quickAdd.test.ts` → FAIL.
- [ ] **Step 3:** Implement. Colour `hex` comes from the matching `product.colours` entry.
- [ ] **Step 4:** Same command → PASS.

### Task 4: Drawer UI

**Files:**
- Create `app/(root)/cart/components/useCartShelf.ts`, `app/(root)/cart/components/CartProductRow.tsx`
- Modify `app/(root)/cart/components/CartSidebar.tsx` (body and CSS string only)

**Interfaces:**
- Consumes: Tasks 1 to 3.
- Produces:
  - `useCartShelf(enabled: boolean): CartShelf | null`: one module-level loader; `listProducts` returns `(await productApi.list({ size: 100 })).content`; errors leave `null`.
  - `CartProductRow({ image, brand, name, price, href, product, onNavigate }: { image: string; brand: string; name: string; price: string | null; href: string; product?: ApiProduct; onNavigate: () => void })`

- [ ] **Step 1: Row.** Thin-bordered (`--hair-c`) row, 3:4 picture via `next/image` (`sizes="72px"`), brand, name, price. With `product`: preview → "Coming Soon"; else `isSoldOut` → "Ausverkauft"; else if `available` and has variants → "+ Hinzufügen". Without `product`: link only.
- [ ] **Step 2: Choice.** "+ Hinzufügen" expands inline: colour buttons only if more than one, then size buttons. Exactly one variant adds directly. A pending flag (ref) blocks a second tap and disables the buttons. Result messages in an `aria-live="polite"` line: login → "Zum Hinzufügen bitte anmelden" → `/account`; atLimit → "Maximale Menge im Warenkorb"; failed → "Hat nicht geklappt. Zum Produkt" → `href`. Success collapses the choice and shows "Im Warenkorb". Do not call `openCart` or change tabs.
- [ ] **Step 3: Warenkorb tab.** Below the item rows, heading plus `pickSuggestions(...)` rows; render nothing when empty. `enabled = isCartOpen && (cartItems.length > 0 || wishlistItems.length > 0)`. Format prices with the file's `fmt`.
- [ ] **Step 4: Wunschliste tab.** Replace only the non-empty branch: one row per favourite using saved `imgURL`, `brandName`, `productName`, `href`; match `product` by `String(id)`; price from the loaded product, else saved `price`. Keep the "Wunschliste ansehen" link below. Empty state unchanged. Do not reuse `.enu-item` (its nth-child delays and hover rules belong to cart lines).
- [ ] **Step 5:** `pnpm run test:run` → all pass (report any pre-existing failure). `pnpm run build` → succeeds.
- [ ] **Step 6: Live check** with chrome-devtools at 1440px and 390px:
  - On drawer open, network shows one curation and one `/products?size=100` request caused by the drawer; reopening and switching tabs adds none.
  - Summary box matches the before screenshot (take it before editing) for the same cart; check item list still scrolls on a short viewport.
  - Suggestions follow the cart's main style; favourites show pictures; one add works; double tap adds once; logged-out add shows the login message (record the actual listings status).
  - Admin login, if needed to inspect Schaufenster, is done by the user.
