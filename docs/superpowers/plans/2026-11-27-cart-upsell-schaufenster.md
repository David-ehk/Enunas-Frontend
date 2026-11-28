# Cart Upsell Schaufenster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The admin picks cart upsells in a "Warenkorb" tab, and the cart shows them, else the newest products.

**Architecture:** `CurationData` gains `cartUpsell`. `pickSuggestions` reads that list in place of the style lists. The existing Schaufenster editor gains a fourth section that reads and writes it.

**Tech Stack:** Next.js 16 App Router, TypeScript, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-27-cart-upsell-schaufenster-design.md`

## Global Constraints

- Follow `CLAUDE.md`: change only what this plan asks; no unrelated refactoring.
- Test first: write the test, run it, see it fail for the expected reason, then implement. Never edit a test and the code it guards in the same step. Do not weaken assertions.
- UI copy is German and verbatim from the spec.
- **No commits, no pushes, no branches.** The user commits themselves. (This replaces the skill's commit steps.)
- **Do not start a dev server or a browser.** The machine ran low on memory; live checks happen afterwards in the main session.
- No requests that write to `api.enunas.com`. No logins.
- Files may use CRLF line endings; keep each file's existing endings.

## Review Focus

1. Curation without `cartUpsell` (older or cached response): cart shows newest products, the Warenkorb tab opens empty, nothing throws. Pinned in Task 1 and Task 2.
2. Numeric product ids from the API against string ids in the list: picks must still match. Pinned by the existing `String()` comparison and Task 1's ordering test.
3. Saving from another tab must keep the saved `cartUpsell`. Pinned in Task 2.
4. Hidden product ids in `cartUpsell` that the editor cannot render stay in the list through edits (editor edits by id, existing behaviour).
5. All picks unusable: newest products, not an empty section. Pinned in Task 1.

---

### Task 1: The cart reads `cartUpsell`

**Files:**
- Modify: `types/api.ts` (`interface CurationData`)
- Modify: `lib/cartSuggestions.ts`
- Modify: `app/(root)/cart/components/CartUpsell.tsx` (its doc comment only)
- Test: `lib/cartSuggestions.test.ts`

**Interfaces:**
- Produces: `CurationData.cartUpsell?: string[]` (optional, so a response without it is valid and existing fixtures stay as they are).
- `pickSuggestions(lines, products, curation): ApiProduct[]` keeps its signature.

- [ ] **Step 1: Add the type field** to `CurationData`: `cartUpsell?: string[];`

- [ ] **Step 2: Update the tests.** Say in your report why existing tests change: the requirement changed (spec, Cart rule 5), the cart no longer uses style lists.
  - Delete only the test `falls back to the next style without mixing`. Keep the `describe('rankCartStyles', …)` block and its import: `lib/wishPicks.ts` (cart favourites) uses that function.
  - Change the `curation` helper to `curation(cartUpsell?: string[], rec: Partial<CurationData['recommendations']> = {}): CurationData`, setting `cartUpsell` only when given.
  - `returns at most 3 in Schaufenster order`: `curation(['15','12','14','11','13'])` expects `['15','12','14']`.
  - `skips in-cart, sold-out, unavailable, preview and unlisted picks`: `curation(['1','2','3','4','99','5'])` expects `['5']` (this also covers "not topped up").
  - Most-recent test: `curation([])`, `curation()` (field missing) and `null` each expect `['22','24','23']`.
  - New `shows the most recent products when no pick can be used`: with products `[cartPiece, ...arrivals]` and `curation(['1','99'])` expect `['22','24','23']`.
  - New `ignores the style lists`: with products `[cartPiece, ...pool, ...arrivals]` and `curation([], { athleisure: ['11','12'] })` expect `['22','24','23']`.
  - Remaining tests: adapt only the helper calls; keep their expected values. The empty-cart test uses `curation(['11'])`.

- [ ] **Step 3: Run** `pnpm run test:run lib/cartSuggestions.test.ts` — expect FAIL: the pick tests get the newest products or style picks instead of the `cartUpsell` ids. Keep the output for your report.

- [ ] **Step 4: Implement.** In `pickSuggestions`, replace the style loop with one pass over `curation?.cartUpsell ?? []`, same `buyable` filter, `slice(0, MAX_PICKS)`; fall back to newest only when that is empty. Keep `rankCartStyles` exported and unchanged, with its imports; leave `lib/wishPicks.ts` untouched. Update the file's header comment (it now covers both the `cartUpsell` picks and the style ranking that favourites use), the doc comment of `pickSuggestions`, and the doc comment in `CartUpsell.tsx`.

- [ ] **Step 5: Run** `pnpm run test:run lib/cartSuggestions.test.ts lib/cartShelf.test.ts` — expect PASS.

---

### Task 2: "Warenkorb" tab in the Schaufenster

**Files:**
- Modify: `app/(dashboard)/dashboard/admin/_components/Storefront.tsx`
- Test: `app/(dashboard)/dashboard/admin/_components/Storefront.test.tsx` (add tests; leave existing ones unchanged)

**Interfaces:**
- Consumes: `CurationData.cartUpsell?: string[]`
- Produces: `SectionTab` includes `'cartUpsell'`.

- [ ] **Step 1: Write the failing tests** in a new `describe('Warenkorb tab', …)`. Build admin products with the fields the editor reads (`id` number, `name`, `brandName`, `images: []`, a `status` that `isProductLive` accepts; check `lib/product.ts`), cast to `AdminApiProduct`.
  - `saves picks to cartUpsell and leaves the other lists alone`: load `{ ...saved, trendy: ['3'], cartUpsell: [] }`; open the `Warenkorb` button; see the text `Erscheint im Warenkorb unter „Empfohlen für dich“`; click products 1 then 2; save. Expect `saveCuration` called with `{ ...saved, trendy: ['3'], cartUpsell: ['1','2'] }`.
  - `keeps the saved cart picks when saving from another tab`: load `{ ...saved, cartUpsell: ['2'] }`; add a product on Trendy; save; the argument has `cartUpsell: ['2']`.
  - `opens empty when the response has no cartUpsell`: load `saved`; open `Warenkorb`; the text `Produkte hierher ziehen oder links anklicken` is shown.
  - `marks the first 3 as shown in the cart`: load `{ ...saved, cartUpsell: ['1','2','3','4'] }` with 4 products; open `Warenkorb`; expect `Direkt sichtbar (1–3)`, `+1 als Ersatz` and `Ersatz, falls oben etwas fehlt`.

- [ ] **Step 2: Run** `pnpm run test:run "app/(dashboard)/dashboard/admin/_components/Storefront.test.tsx"` — expect the new tests to FAIL (no `Warenkorb` button) and the existing ones to PASS. If the path filter matches nothing, use `Storefront.test`.

- [ ] **Step 3: Implement.** Add `{ id: 'cartUpsell', label: 'Warenkorb' }` to `SECTION_TABS`; `getIds` returns `c.cartUpsell ?? []`; `setIds` returns `{ ...c, cartUpsell: ids }`. Add the hint paragraph styled like the Trendy hint. Derive `const fold = section === 'cartUpsell' ? 3 : 4` and use it for `isAboveFold`, the legend, the overflow count and the divider position, with the spec's texts for the cart and the current texts otherwise.

- [ ] **Step 4: Run** the same command — expect all PASS.

---

### Task 3: Verify the whole project

- [ ] **Step 1:** `pnpm run test:run` — the full suite. Report totals. For any failure, show it and say whether your change caused it (compare with `git stash` is NOT allowed; reason from the files involved). Do not fix unrelated failures.
- [ ] **Step 2:** `pnpm run build` — expect success. Do not pipe it through `Select-Object -First` (it kills the build).
- [ ] **Step 3:** `git diff --stat` and `git status --short` — only the files named in this plan, plus the spec and this plan, are changed.
