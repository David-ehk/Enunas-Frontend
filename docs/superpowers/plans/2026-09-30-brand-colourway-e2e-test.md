# Brand Colourway End-to-End Test Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove, by clicking and typing through the real app with the chrome-devtools MCP, that a brand partner can create products with several colours and a different image set per colour, that each colour shows its own images everywhere in the app, that every brand dashboard view works, and that a multi-brand order which includes this brand works end to end: order, fulfilment, return and payout.

**Architecture:** Two automated layers first. A Vitest unit test pins the "which images belong to this swatch" rule, and a Playwright spec pins the PDP gallery swap on a real product. After that comes a long, manual-but-scripted chrome-devtools MCP walkthrough. It runs across four roles: Brand A, Brand B, Customer and Admin. Every interactive element on every view gets clicked or typed into and is logged in a coverage ledger. Any bug found is logged; it is **not** fixed in this plan. Each fix gets its own follow-up task, per CLAUDE.md rule 1.

**Tech Stack:** Next.js 16 dev server, Vitest 3 (`pnpm run test:run`), Playwright 1.61 (`pnpm run test:e2e`), chrome-devtools MCP (`mcp__chrome-devtools__*`), and the production Spring API at `https://api.enunas.com`, which `.env.local` points at.

**Spec:** No separate spec doc exists. The user's request of 2026-09-30 is the spec: *"test the brand-partner side creating products with different colours with different pictures shown for each colour, through the brand dashboard and every view on the brand dashboard, a multi-brand order with different brands that includes that brand, and whether brand products are shown properly everywhere in the application; click or type into every button with the chrome MCP."*

## Global Constraints

- **Production backend.** Every write is real. Prefix every test entity with `E2E-0930` so it is findable and can be archived afterwards (Task 12).
- **Test accounts** (shared password `EnunasTest2026!`). Details are in memory `project_test_accounts.md`:
  - Brand A: `davidemmanuel.konan+enunas0109@gmail.com` ("Claude Testmarke 0109", brand id 5)
  - Brand B: `davidemmanuel.konan+enunas0109b@gmail.com` ("Claude Testmarke 0109B")
  - Customer: `davidemmanuel.konan+kunde0903@gmail.com` (user id 17)
  - Admin: `enunas.munich@gmail.com`. The password is not recorded; ask the user at Task 6.
- **One role per browser profile.** All roles share the `enunas_token` localStorage key. Always log out, or run `localStorage.removeItem('enunas_token')` via `evaluate_script`, before switching roles. A dashboard that renders empty with 403s means the wrong token is loaded. It is not a bug.
- **Mock fallback must be off:** start the dev server with `NEXT_PUBLIC_DISABLE_MOCK=true`. Otherwise `lib/api/productResolver.ts` silently serves mock products and hides real failures.
- **No real money.** Only continue past the payment step if the checkout URL is `/mock-checkout/...` or a Mollie **test-mode** page. If it is live Mollie, stop and ask the user (Task 2, Step 5).
- **Status transitions:** `PAID → SHIPPED → DELIVERED`. `PAID → DELIVERED` returns 409. Returns need `DELIVERED`.
- **Returns** use `/admin/returns/{returnNumber}/*` only. The old `/admin/orders/{id}/return/receive` endpoint returns HTTP 500.
- **Commits:** stage explicit paths only. `ImageGallery.tsx`, `globals.css` and `GlassCursor.tsx` have unrelated uncommitted changes and must not be swept in.
- **Test procedure (CLAUDE.md):** write the test, see it fail, implement, see it pass, and report both outputs. Never edit a test to make it pass.

## Review Focus

These are the five failure modes most likely to bite a real shopper. No unit test covers them, so each one is pinned by a named ledger check:

1. **A colour with no images of its own.** The PDP must fall back to the shared images, or to all images, and never show an empty gallery. Pinned in Task 1 (unit) and Task 7 Step 4 (P2 / GREEN).
2. **Cart and checkout thumbnails after a colour switch.** The line item must show the chosen colour's cover image, not the first gallery image of the colour selected earlier. Pinned in Task 9 Steps 2–4.
3. **A multi-brand order seen by one brand.** Brand A's "Bestellungen" must show only Brand A's lines and totals, never Brand B's items or customer totals. Pinned in Task 10 Step 2.
4. **Image re-tagging and deleting in the dashboard.** The product-list thumbnail and the PDP must change after reassigning an image's colour or deleting the primary image, without a manual refresh. Pinned in Task 4 Steps 6–8 and Task 7 Step 3.
5. **Per-colour listing cards (`?color=`).** A card for RED must open the PDP with RED selected and RED images, including colour names with umlauts or spaces (`Weiß`). Pinned in Task 7 Step 2.

---

## Execution Protocol (applies to every chrome-devtools task)

For **each view**:

1. `take_snapshot` and copy every interactive node (button, link, textbox, combobox, checkbox, radio, file input) into the ledger under the view's heading, as `- [ ] <uid> <role> "<name>"`.
2. Act on each one: `click`, `fill`/`type_text` (a textbox gets a valid value and one invalid value), a combobox gets every option, `upload_file` for dropzones, and `hover` first for hover-revealed controls (the image Star/Trash buttons are `opacity-0 group-hover`).
3. After each action:
   - `list_console_messages`: note any `error`.
   - `list_network_requests`: note any 4xx or 5xx, and use `get_network_request` for the body.
   - `take_screenshot` whenever the visible state changed. Save it to `e2e/reports/2026-09-30/<task>-<step>.png`.
4. Mark the ledger line `[x] PASS` or `[x] FAIL — <what happened, request id, screenshot>`.
5. Always leave destructive controls (Löschen, Abmelden, Stornieren) until **last** in a view, and use them only on throwaway entities made for that purpose.
6. If a control opens a native `confirm()`, call `handle_dialog` with `accept` for the throwaway entity, and `dismiss` once first to confirm that cancelling is a no-op.

Ledger file: `e2e/reports/2026-09-30-brand-colourways-ledger.md`. Screenshots go next to it.

---

### Task 1: Unit-test the per-colour gallery rule

The swatch→images rule currently sits inline in a `useMemo` in `ProductDetails.tsx:173-184`, where it cannot be tested. This task moves it into a pure function next to `colourwayCoverImage` without changing behaviour. **It is the only production-code change in this plan.** If the user wants zero code changes, skip this task; Task 4's Playwright spec still covers the behaviour end to end.

**Files:**
- Modify: `lib/colourwayImage.ts` (add `galleryImagesForColour`)
- Modify: `app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx:170-184` (call it)
- Test: `lib/colourwayImage.test.ts` (append)

**Interfaces:**
- Produces: `galleryImagesForColour(imageObjects: ApiProductImageObject[] | undefined, flatImages: string[], colorId: number | null): string[]`

- [ ] **Step 1: Write the failing test.** Append to `lib/colourwayImage.test.ts`, change the import line to `import { colourwayCoverImage, galleryImagesForColour } from './colourwayImage'`, and add:

```ts
describe('galleryImagesForColour', () => {
  const flat = ['shared.jpg', 'black.jpg', 'beige.jpg', 'green.jpg']

  it("shows the colourway's own images plus the shared ones, and nothing from other colourways", () => {
    expect(galleryImagesForColour(cargoPant, flat, 33)).toEqual(['shared.jpg', 'beige.jpg'])
  })

  it('puts the primary image first', () => {
    const images = [...cargoPant, { url: 'beige-cover.jpg', productColorId: 33, primary: true }]
    expect(galleryImagesForColour(images, flat, 33)[0]).toBe('beige-cover.jpg')
  })

  it('falls back to the flat list when the backend sends no per-image colour metadata', () => {
    expect(galleryImagesForColour(undefined, flat, 33)).toEqual(flat)
    expect(galleryImagesForColour([], flat, 33)).toEqual(flat)
  })

  it('falls back to the flat list rather than an empty gallery when nothing matches', () => {
    const noShared = cargoPant.filter(i => i.productColorId !== null)
    expect(galleryImagesForColour(noShared, flat, 99)).toEqual(flat)
  })

  it('shows only shared images when no colour is selected', () => {
    expect(galleryImagesForColour(cargoPant, flat, null)).toEqual(['shared.jpg'])
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails.**
  Run: `pnpm run test:run lib/colourwayImage.test.ts`
  Expected: FAIL with `galleryImagesForColour is not a function` (or an import error). Save the output for the report.

- [ ] **Step 3: Write the minimal implementation.** Append to `lib/colourwayImage.ts`:

```ts
/**
 * PDP gallery for one swatch: the colourway's own images plus every shared (untagged) one,
 * primary-first. Falls back to `flatImages` when there is no per-image colour metadata, or when
 * nothing matches — an empty gallery is never shown.
 */
export function galleryImagesForColour(
  imageObjects: ApiProductImageObject[] | undefined,
  flatImages: string[],
  colorId: number | null,
): string[] {
  if (!imageObjects || imageObjects.length === 0) return flatImages
  const urls = imageObjects
    .filter(io => io.productColorId == null || io.productColorId === colorId)
    .sort((a, b) => Number(b.primary) - Number(a.primary))
    .map(io => io.url)
  return urls.length > 0 ? urls : flatImages
}
```

In `ProductDetails.tsx`, replace the body of the `galleryImages` `useMemo` (lines 173-184, keeping the comment above it) with:

```ts
  const galleryImages = useMemo(
    () => galleryImagesForColour(product.imageObjects, product.images, selectedColorId),
    [product.imageObjects, product.images, selectedColorId],
  )
```

and extend the existing import to `import { colourwayCoverImage, galleryImagesForColour } from '@/lib/colourwayImage'`.

- [ ] **Step 4: Run the test and confirm it passes.**
  Run: `pnpm run test:run lib/colourwayImage.test.ts`. Expected: all tests PASS.
  Run: `pnpm run build`. Expected: build succeeds with no type errors.

- [ ] **Step 5: Commit.**

```bash
git add lib/colourwayImage.ts lib/colourwayImage.test.ts "app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx"
git commit -m "test(pdp): extract and pin per-colour gallery selection"
```

---

### Task 2: Fixtures, environment and preflight

**Files:**
- Create: `e2e/fixtures/make-colourway-images.ps1`
- Create: `e2e/fixtures/colourways/*.jpg` (generated)
- Create: `e2e/reports/2026-09-30-brand-colourways-ledger.md`

- [ ] **Step 1: Write the image generator.** Each image is a solid colour with a large label, so a screenshot proves which colourway's image is showing.

```powershell
# e2e/fixtures/make-colourway-images.ps1 — 900x1200 JPGs, one solid colour + big label each.
Add-Type -AssemblyName System.Drawing
$out = Join-Path $PSScriptRoot 'colourways'
New-Item -ItemType Directory -Force $out | Out-Null
$sets = @(
  @{ n='P1-BLACK-1'; bg='#111111'; fg='#FFFFFF' }, @{ n='P1-BLACK-2'; bg='#333333'; fg='#FFFFFF' },
  @{ n='P1-WHITE-1'; bg='#F2F2F2'; fg='#111111' }, @{ n='P1-WHITE-2'; bg='#DADADA'; fg='#111111' },
  @{ n='P1-RED-1';   bg='#B01E2A'; fg='#FFFFFF' }, @{ n='P1-RED-2';   bg='#7A0F18'; fg='#FFFFFF' },
  @{ n='P1-SHARED';  bg='#F5F5F0'; fg='#370E4D' },
  @{ n='P2-BLUE-1';  bg='#1F3F8F'; fg='#FFFFFF' }, @{ n='P2-SHARED';  bg='#E8E8E8'; fg='#370E4D' },
  @{ n='P3-BEIGE-1'; bg='#D8C3A0'; fg='#111111' }
)
foreach ($s in $sets) {
  $bmp = New-Object System.Drawing.Bitmap 900, 1200
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml($s.bg))
  $font = New-Object System.Drawing.Font 'Arial', 72, ([System.Drawing.FontStyle]::Bold)
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($s.fg))
  $g.DrawString($s.n, $font, $brush, 60, 540)
  $bmp.Save((Join-Path $out "$($s.n).jpg"), [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $g.Dispose(); $bmp.Dispose()
}
```

- [ ] **Step 2: Generate and verify.** Run: `powershell -File e2e/fixtures/make-colourway-images.ps1`, then `ls e2e/fixtures/colourways`.
  Expected: 10 `.jpg` files. Open one with Read to confirm the label is visible.

- [ ] **Step 3: Start the dev server with mocks off.** First check memory `project_dev_server_management.md` for orphaned node or lock files. Then run in the background:
  `$env:NEXT_PUBLIC_DISABLE_MOCK='true'; pnpm run dev`
  Expected: `Ready` on `http://localhost:3000`.

- [ ] **Step 4: Chrome MCP preflight.** Call `list_pages`. If it errors with a profile lock, follow memory `project_chrome_mcp_profile_lock.md`: kill the orphaned Chrome, then retry. `navigate_page` to `http://localhost:3000`, then `list_console_messages`, and expect no errors.

- [ ] **Step 5: Payment-mode gate.** Log in as Customer, add any in-stock product and open `/checkout`. Fill the address and click the pay button, but **before paying**, read the redirect URL with `list_pages` or `list_network_requests` on `POST /orders` → `checkoutUrl`.
  - `localhost:3000/mock-checkout/...` or a Mollie page showing "Test mode": continue. Cancel this probe order via Admin in Task 10, or leave it unpaid.
  - A live Mollie page: **stop and ask the user** how the multi-brand order should be paid. Record the answer in the ledger.

- [ ] **Step 6: Create the ledger skeleton.** One `##` heading per task and view below: Wizard, Images, Products list, Overview, Bestellungen, Retouren, Auszahlungen, Rabattcodes, Einstellungen, Analytics, Marketing, each storefront surface, Cart, Checkout, Account and Admin.

- [ ] **Step 7: Commit the fixtures and generator** (not the reports):

```bash
git add e2e/fixtures/make-colourway-images.ps1 e2e/fixtures/colourways
git commit -m "test(e2e): colour-labelled image fixtures for colourway testing"
```

---

### Task 3: Brand A creates product P1 (3 colours) through every wizard control

Log in at `http://localhost:3000/dashboard/login` as **Brand A**. Open "Produkte" and start the create wizard (`_components/products/CreateWizard.tsx`, 5 steps).

- [ ] **Step 1: Validation (negative).** On Step 1 "Grunddaten", click "Weiter" with every field empty.
  Expected: an inline error, and the wizard stays on step 1. Screenshot it.

- [ ] **Step 2: Step 1 "Grunddaten", every control:**
  - `fill` Name = `E2E-0930 Colour Hoodie`
  - Description = `Colourway test product — three colours, own images per colour.`
  - Click each gender button in turn, ending on `Unisex` (or the last one listed), and confirm the active styling moves each time.
  - Product type: select each option once, ending on a hoodie or top type.
  - Return period: type `31`, which should be clamped or rejected (max 30), then `14`.
  - Material = `100% Baumwolle`, Origin = `Portugal`, Care = `30°C Maschinenwäsche`, Collection = `E2E Herbst 2026`
  - Release date = today
  - Catalogue toggles: click every option. Confirm the max-selection cap greys the rest out, then deselect down to one.
  - Inspiration story = `Test story`
  - Click "Weiter".
- [ ] **Step 3: Step 2 "Varianten":**
  - Click every colour chip once, confirming the active state moves, then choose `BLACK`.
  - Toggle every size chip on and off, then select `S, M, L`.
  - Fill the batch stock and SKU inputs (both `<input>`s at lines 511 and 521) with `5` and `E2E-P1`.
  - Click "3 Varianten hinzufügen (Schwarz)".
  - Repeat for `WHITE` (sizes `M, L`) and `RED` (sizes `S, M`), giving 7 variant rows.
  - On one row, change the colour and size `<select>` and edit stock. Click its remove button (✕) on a duplicate row made for this purpose.
  - Click "Zurück" and confirm the Step 1 data is kept, then click "Weiter" twice.
- [ ] **Step 4: Step 3 "Preis":**
  - Click every price-mode button, and confirm the price inputs clear each time.
  - Select each region option.
  - Type an invalid price `abc`, then click "Weiter": expect an error. Then type `89,95` and discount `69,95`.
  - Check that the Netto / MwSt. 19 % / Endkundenpreis breakdown adds up. Do the arithmetic by hand and log it.
  - Click "Weiter".
- [ ] **Step 5: Step 4 "Look":**
  - Open the look picker, select 2 items, deselect one, and click "Überspringen" once (it resets selection and advances). Go "Zurück", re-select, and click "Weiter".
- [ ] **Step 6: Step 5 "Überprüfung":**
  - Confirm every value from steps 1–4 is shown, then click "Zurück" and "Weiter" once.
  - Click submit, and watch `POST /products/create` followed by `POST /products/{id}/listings` in `list_network_requests`.
  - Expected: both return 2xx, and the new product appears in the list with status PENDING (or ACTIVE). Record the **product id** and the 3 **ProductColor ids** from the create response `colors[]` in the ledger.

---

### Task 4: Per-colour images for P1, plus the Playwright gallery regression spec (red, then green)

**Files:**
- Create: `e2e/brand-colourways.spec.ts`

- [ ] **Step 1: Write the Playwright spec first.** It is read-only against an existing product and parameterised by env vars:

```ts
import { test, expect } from '@playwright/test'

// Regression for per-colour PDP galleries on a real product. Set E2E_PDP_PATH to the product's
// storefront path (e.g. /bekleidung/claude-testmarke-0109/e2e-0930-colour-hoodie) and
// E2E_COLOURS to "Schwarz:P1-BLACK,Weiß:P1-WHITE,Rot:P1-RED" (swatch name : image-name prefix).
const path = process.env.E2E_PDP_PATH
const colours = (process.env.E2E_COLOURS ?? '').split(',').filter(Boolean).map(p => p.split(':'))

test.skip(!path, 'E2E_PDP_PATH not set')

for (const [swatch, prefix] of colours) {
  test(`PDP gallery for ${swatch} shows only its own + shared images`, async ({ page }) => {
    await page.goto(`${path}?color=${encodeURIComponent(swatch)}`, { waitUntil: 'domcontentloaded' })
    const srcs = await page.locator('main img').evaluateAll(els => els.map(e => (e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src))
    const decoded = srcs.map(decodeURIComponent)
    expect(decoded.some(s => s.includes(prefix))).toBe(true)
    for (const [, other] of colours) {
      if (other !== prefix) expect(decoded.some(s => s.includes(other))).toBe(false)
    }
  })
}
```

**Note:** the check relies on the uploaded S3 key keeping the fixture filename. If Step 2 shows the key is a UUID, switch the assertion to compare against the image URLs listed per colour in the ledger (Step 5). Record which variant was used.

- [ ] **Step 2: Upload images.** Before that, open the product's edit panel and find "Produktbilder" (`ImagesSection.tsx`). Expected groups: "Alle Farben (geteilt)", "Schwarz", "Weiß" and "Rot", each with its own dropzone.
  - Before any upload, click the product's storefront link. Its path is `/bekleidung/<brand-slug>/<product-slug>`; record it.
- [ ] **Step 3: Red phase.** P1 has no images yet, so the spec should fail.
  Run: `$env:E2E_PDP_PATH='<path>'; $env:E2E_COLOURS='Schwarz:P1-BLACK,Weiß:P1-WHITE,Rot:P1-RED'; pnpm run test:e2e e2e/brand-colourways.spec.ts`
  Expected: 3 FAIL (no image contains the prefix). Save the output. If the product is not visible yet (PENDING), do Task 6 Step 1 for P1 first, then run this.
- [ ] **Step 4: Upload per colour with `upload_file`** on each group's dropzone file input:
  - Shared: `P1-SHARED.jpg`
  - Schwarz: `P1-BLACK-1.jpg` and `P1-BLACK-2.jpg`
  - Weiß: `P1-WHITE-1.jpg` and `P1-WHITE-2.jpg`
  - Rot: `P1-RED-1.jpg` and `P1-RED-2.jpg`

  After each upload:
  - The image appears in the right group and the group counter increments.
  - The product-list row thumbnail updates without clicking "Aktualisieren" (`onImagesChanged`).
  - Also try a >10 MB file and a `.txt` file; the dropzone must reject each with a message. Generate these in the scratchpad.
- [ ] **Step 5: Log each uploaded image's URL** per colour in the ledger (from `GET /products/{id}/media/images`).
- [ ] **Step 6: Primary per colour.** `hover` over `P1-BLACK-2`, then click the Star ("Als Titelbild setzen"). Expected: the "Titel" badge moves to BLACK-2, and BLACK-1 loses it. The WHITE and RED primaries stay unchanged, so the rule is one primary per group.
- [ ] **Step 7: Reassign colour.** On `P1-RED-2`, use its `<select>` to pick "Weiß". It must move to the Weiß group after the refetch. Move it back to "Rot". Also pick "Alle Farben (geteilt)" once, then back.
- [ ] **Step 8: Delete.** Upload an extra `P1-RED-1.jpg` into Rot as a throwaway, `hover`, and click Trash ("Bild löschen"). It disappears, and the list thumbnail updates.
- [ ] **Step 9: Nudge text.** With the shared image present and 3 colours, the yellow "Tipp: Weise Bilder einer Farbe zu…" hint is visible.
- [ ] **Step 10: Green phase.** Re-run the Step 3 command. Expected: 3 PASS. Save the output.
- [ ] **Step 11: Commit the spec.**

```bash
git add e2e/brand-colourways.spec.ts
git commit -m "test(e2e): per-colour PDP gallery regression spec"
```

---

### Task 5: Products P2 (colour without own images) and P3 (Brand B)

- [ ] **Step 1: P2 as Brand A.** Create `E2E-0930 Fallback Tee`, repeating the Task 3 flow in short: every step's "Weiter", no negative checks.
  - Colours: `BLUE` (M, L) and `GREEN` (M).
  - Images: `P2-BLUE-1.jpg` to Blau and `P2-SHARED.jpg` to shared. **Give GREEN no images.**
  - Price: `39,95`, with no discount.
- [ ] **Step 2: P3 as Brand B.** Log out (Abmelden), then log in as Brand B. Create `E2E-0930 Brand B Trouser`: one colour `BEIGE` (M, L), image `P3-BEIGE-1.jpg` in Beige, price `59,95`.
- [ ] **Step 3:** Record P2 and P3 ids, slugs and colour ids in the ledger. Log out.

---

### Task 6: Admin approval (only if products are PENDING)

- [ ] **Step 1:** Ask the user for the admin password if it is not already known. Log in as Admin, go to `/dashboard/admin` → products and filter or search `E2E-0930`.
- [ ] **Step 2:** For each of P1, P2 and P3, open the detail and confirm the admin view shows all colours and all per-colour images. This is a finding if the admin preview ignores colours. Click "Freigeben" (approve), and expect status ACTIVE.
- [ ] **Step 3:** Log out.

---

### Task 7: Brand products across every storefront surface (logged out, then Customer)

Run every step at **desktop 1440×900**, then repeat at **mobile 390×844** (`emulate` or `resize_page`). Look for broken images, the wrong colour image, a missing brand name, a wrong price, or layout overflow at 390px.

- [ ] **Step 1: Discovery surfaces.** Check each, log whether P1/P2/P3 appear, and click through to the PDP:
  - `/` homepage: NewProducts, PopularProduct and the sidebar
  - Navbar search: type `E2E-0930`, and expect all 3 in results. Also type `Colour Hoodie` and `xxxxxxx` (the empty state).
  - `/bekleidung` (feed)
  - `/bekleidung/<brand-A-slug>` and `/bekleidung/<brand-B-slug>`
  - `/bekleidung/catalogue/<catalogue chosen in Task 3>` plus the catalogue landing page
  - `/bekleidung/streetwear`, `/athleisure`, `/cultural`, `/experimental` and `/star` (whichever matches P1's catalogue)
  - `/marken`: both brands are listed. Also `/marken/<brand-A>`: the brand bio from Settings (Task 11) and P1 + P2 are shown, and P3 is **not**.
  - `/angebot/<brand-A>`: P1 appears here because it has a discount price.
  - `/neu`, `/trendy`, `/drop` and `/catalogue`: as of 2026-09-30 these pages make no product API calls. Record whether the products appear. Absence is a **known gap**, not a test failure; list it in the final report.
- [ ] **Step 2: Per-colour cards.** Wherever a listing shows one card per colour, confirm each card's image matches its colour. Click the RED card: the URL has `?color=Rot` (or the backend colour name), the RED swatch is pre-selected, and the gallery shows only RED + SHARED images. Repeat for `Weiß`, which checks umlaut encoding.
- [ ] **Step 3: P1 PDP interactions.**
  - Click each swatch in turn. The gallery swaps to exactly that colour's images + SHARED, with the primary first (BLACK shows BLACK-2 first after Task 4 Step 6).
  - Click every gallery thumbnail, the zoom control and every arrow, and press ArrowLeft/ArrowRight/Escape.
  - Size selector: sizes not stocked for the colour are disabled (WHITE has no S). Switching BLACK S → WHITE resets the size.
  - The SKU is shown after the colour is picked.
  - Check the price and strike-through discount (`69,95` vs `89,95`), the brand link (goes to the brand page), the gender badge, catalogue tags, the size-guide row, the inspiration story, and "Vervollständige den Look" (both look items clickable).
  - Favourite/save button (logged out: auth prompt).
- [ ] **Step 4: P2 fallback (Review Focus 1).** Select GREEN. The gallery shows `P2-SHARED` (not empty, not BLUE). Delete P2's shared image as Brand A, reload, and select GREEN: it now shows the full flat list (`P2-BLUE-1`), never an empty gallery. Re-upload the shared image afterwards.
- [ ] **Step 5: P3 PDP.** One colour, own image, and the Brand B name and link are correct.
- [ ] **Step 6: Log in as Customer.** Save P1 (RED) and P3 to a saved list. Open `/saved-lists`: correct image per saved colour, and remove/re-add works.
- [ ] **Step 7:** Run `list_console_messages` on every page visited. Log any hydration warnings or errors.

---

### Task 8: Multi-brand cart (Customer)

- [ ] **Step 1: Add to cart:**
  - P1 BLACK M (qty 1)
  - P1 RED S (qty 2)
  - P2 GREEN M (qty 1)
  - P3 BEIGE L (qty 1)
- [ ] **Step 2: Cart sidebar.** Check the 4 separate lines (the ID is `productId+size+colour`, so the two P1 lines must not merge). Each thumbnail is that colourway's cover image: BLACK-2, RED-1 (or RED primary), P2-SHARED fallback, and BEIGE-1. Increment, decrement, and remove, then re-add one line. Close with ✕, the overlay click and Escape.
- [ ] **Step 3: Cart page `/cart`.** Same image checks (Review Focus 2), the quantity controls, and the subtotal arithmetic done by hand. "Similar products" renders without errors.
- [ ] **Step 4: Colour switch after adding.** Open the P1 PDP, select WHITE, then add M. The new cart line shows a WHITE image, not the BLACK one. Remove this line again.
- [ ] **Step 5:** Reload the page. The cart persists (localStorage) with the same images.

---

### Task 9: Checkout and payment (Customer)

- [ ] **Step 1: `/checkout`.**
  - Auth gate (already logged in, so skipped).
  - Saved address selector: choose each saved address.
  - New-address form: type into every field, with invalid postcode `12` then `80331`.
  - Address autocomplete: type `Marienplatz`. Suggestions may be empty on localhost; see memory `project_maps_key_referrer_restriction.md`, and log that as a known limitation, not a failure.
  - Check the order summary: 4 lines, per-colour thumbnails, brand names, the totals, and the discount applied to P1.
- [ ] **Step 2: Pay** according to the Task 2 Step 5 gate. Record the order id and order number.
- [ ] **Step 3: Confirmation.** `/checkout/bestaetigung` and/or `/orders/<orderNumber>/confirmation` show all 4 lines with correct colour images and the total.
- [ ] **Step 4: `/account` → orders.** The order is listed with status PAID. The detail shows all items grouped (or labelled) by brand, with per-colour thumbnails. Log out.

---

### Task 10: Brand dashboards after the order, covering every view

Do this for **Brand A** fully, then for **Brand B** (Steps 2–3 only). Follow the Execution Protocol for every view.

- [ ] **Step 1: Übersicht (Overview).**
  - KPIs and revenue now include this order. Brand A's revenue = P1 lines + P2 line only; check it by hand.
  - "Offene Punkte" shows the new order to ship. Click each item: `onNavigate` switches to the right tab.
  - Click every chart legend and period toggle.
- [ ] **Step 2: Bestellungen (Fulfillment), Review Focus 3.**
  - Filter chips: Alle, Versandbereit, Versandt, Geliefert, Rückgabe(n). Click each.
  - Search box: type the order number, a product name, a city, and `zzz`.
  - "Aktualisieren".
  - Open the order: **only** Brand A's 3 lines, each with the right colour image, colour and size. P3 and Brand B's amounts appear nowhere.
  - Click "Problem melden", type into the textarea, then cancel once. Submit on a **separate throwaway order** if one exists; otherwise only cancel.
  - Ship: fill tracking `1Z999AA10123456784`, select the carrier, and submit. The status becomes SHIPPED.
- [ ] **Step 3: Brand B.** Log in, check that its Fulfillment shows only P3, and ship it. Log out.
- [ ] **Step 4: Admin.** Mark the order DELIVERED (`SHIPPED → DELIVERED`), then log out.
- [ ] **Step 5: Customer return.** In `/account`, request a return of **P1 RED S (1 of 2)**, and click each reason option. Expect one return number for Brand A only. Log out.
- [ ] **Step 6: Admin returns.** Using the `/admin/returns/{returnNumber}` flow: approve, then receive, then refund.
  - Check `/admin/reconciliation/5` for drift.
  - Run `POST /admin/payouts/generate` from the admin UI.
- [ ] **Step 7: Brand A, remaining views.** Execute the full protocol on each:
  - **Produkte:**
    - Search `E2E`, `Hoodie` and `zzz`, plus "Aktualisieren".
    - Open P1's edit panel:
      - Produktdetails: edit Material, Herkunft and Beschreibung. Save, reload, and confirm persisted. Click "Abbrechen" on a second edit.
      - Varianten: add a variant `RED L` and edit stock. Delete that new variant only. Confirm the PDP then offers RED L, and after the delete, no longer offers it.
      - Preisgestaltung/Listings: edit the price to `84,95`, then check the PDP. Revert to `89,95`. Delete only a listing created for this purpose ("Löschen", dialog dismiss, then accept).
      - Vervollständige den Look: add or remove one item.
      - Produktbilder: re-verify the groups as in Task 4.
  - **Retouren:** the return shows with status progressing through Beantragt, Genehmigt, Eingegangen and Erstattet. Check the colour image and reason label, click each status filter, and confirm the analysis cards render.
  - **Auszahlungen:** "Neu laden", each status filter, and the payout row for the order net of the refund. Check it by hand.
  - **Rabattcodes:**
    - Create `E2E0930` (10 %), search `E2E`, and edit it.
    - Then as Customer, check it applies at checkout for Brand A items only. This is a finding if it discounts P3.
    - Then delete it.
  - **Einstellungen:** every field in Markenprofil, Öffentliches Profil, Unternehmens- & Steuerdaten and Retouren:
    - Type an invalid URL and an invalid VAT id `DE12`, and expect validation.
    - Set the bio to `E2E-0930 bio` and save. Confirm it on `/marken/<brand-A>` and revert it afterwards.
    - Konto-Informationen is read-only; confirm it.
  - **Analytics** and **Marketing** ("bald", mock data): click every control. Confirm they render with no console errors, and note in the report that the numbers are placeholders.
  - **Abmelden:** last. Expect a redirect to `/dashboard/login`, and that `/dashboard/vendor` redirects back to login.

---

### Task 11: Negative and boundary sweep

- [ ] **Step 1:** Logged in as Customer, open `/dashboard/vendor`: expect a redirect to `/dashboard/login`.
- [ ] **Step 2:** As Brand B, try `PUT /products/update/<P1 id>` via `evaluate_script` fetch with Brand B's token. Expect 403 or 404, never 200. Log the result.
- [ ] **Step 3:** Open P1's PDP with `?color=Doesnotexist`. It falls back to the first colour without errors.
- [ ] **Step 4:** Set P1 WHITE stock to 0 as Brand A. The PDP shows WHITE sizes as sold out, and add-to-cart is blocked. Restore the stock.
- [ ] **Step 5: Keyboard-only pass on the P1 PDP and the vendor sidebar.** Every control is reachable with Tab, and the focus ring is visible. Take screenshots.
- [ ] **Step 6:** Take `emulate` screenshots with reduced motion on the PDP and homepage. Transitions should be suppressed.

---

### Task 12: Report and clean up

- [ ] **Step 1:** Compile `e2e/reports/2026-09-30-brand-colourways-report.md` with these sections:
  - Summary of PASS/FAIL counts from the ledger.
  - Unit and Playwright red and green outputs from Tasks 1 and 4.
  - Every FAIL with its screenshot path, request id and repro steps, most severe first.
  - Known gaps (neu/trendy/drop static, Maps key, mock analytics).
  - Coverage: which views had 100 % of their snapshot controls exercised.
- [ ] **Step 2: Archive the test data.**
  - As Admin, hide P1, P2 and P3. The backend cannot hard-delete (409); see memory `project_admin_product_delete.md`.
  - Leave the order and return in place as history.
  - Revert the Brand A settings changes.
- [ ] **Step 3:** Stop the dev server and close the Chrome pages.
- [ ] **Step 4:** Present the report to the user. **Do not fix any FAIL in this plan.** Propose each as a separate follow-up.
