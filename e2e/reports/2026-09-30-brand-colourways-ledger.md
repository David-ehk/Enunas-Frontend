# Coverage ledger — brand colourway E2E (production, 2026-09-30)

Format per control: `- [x] PASS|FAIL <role> "<name>" — note (screenshot path)`


## Phase A

### Task 3 — Wizard (P1 "E2E-0930 Colour Hoodie"), brandA tab (pageId 3)
- [x] PASS brandA "Einloggen" (dashboard/login) — logged in as Claude Testmarke 0109, redirected to /dashboard/vendor
- [x] PASS brandA "Produkte" (sidebar) — product list rendered (5 products)
- [x] PASS brandA "Neues Produkt" — wizard opened on step 1 Grunddaten
- [x] PASS brandA "Weiter: Varianten →" (all empty) — inline "Name ist erforderlich.", stays on step 1 (A-3-1-validation.png)
- [x] PASS brandA "Weiter: Varianten →" (name only) — "Beschreibung ist erforderlich."
- [x] PASS brandA textbox "Produktname" — E2E-0930 Colour Hoodie
- [x] PASS brandA textbox "Beschreibung" — filled
- [x] PASS brandA "Herren" / "Damen" / "Unisex" — active bg #370E4D moved each click, ended Unisex
- [x] PASS brandA combobox "Produkttyp" — all 23 options selected once (T SHIRT…OTHER), ended HOODIE
- [x] FAIL brandA spinbutton "Rückgabefrist" = 31 — not clamped, no inline error; browser marks invalid but wizard advanced to step 2 with 31 (LOW; A-3-2-return31-accepted.png). Repro: step 1, type 31, fill rest, Weiter → step 2 opens. Corrected to 14 via Zurück.
- [x] PASS brandA textboxes Material / Herkunftsland / Pflegehinweise / Kollektion — 100% Baumwolle / Portugal / 30°C Maschinenwäsche / E2E Herbst 2026
- [x] PASS brandA date "Release-Datum" — 29.09.2026 (yesterday, avoids UTC Coming-Soon edge); create response preview:false
- [x] PASS brandA catalogue "Streetwear","Cultural","Experimental" — 3/3 selected, "Athleisure","Star" disabled (cap works) (A-3-2-catalogue-cap.png)
- [x] PASS brandA catalogue "Athleisure","Star" — after deselecting 2, both selectable; deselected down to Streetwear only (1/3)
- [x] PASS brandA textbox "Inspirationsgeschichte" — Test story
- [x] PASS brandA "Weiter: Preis →" with 0 variants — "Mindestens eine Variante hinzufügen."
- [x] PASS brandA colour chips (all 15: Schwarz…Sonstige) — active border moved to last clicked each time
- [x] PASS brandA size chips XS,S,M,L,XL,XXL,3XL — toggled on (button "7 Varianten hinzufügen") and off; S,M,L → "3 Varianten hinzufügen (Schwarz)"
- [x] PASS brandA spinbutton "Bestand je Größe" = 5, "Gewicht (g)" = 600 — NOTE: plan says "stock + SKU" inputs; the second input is Gewicht, SKU is auto-generated per colour by backend
- [x] PASS brandA "3 Varianten hinzufügen (Schwarz)", "2 … (Weiß)" M/L, "2 … (Rot)" S/M — 7 rows; sizes reset after each add
- [x] PASS brandA throwaway row 8 (Schwarz XL): colour select → Grau, size select → XXL, stock 3, weight 500 — values updated
- [x] FAIL brandA row 8 changed to Schwarz/S (duplicate of row 1) — no duplicate warning in UI (LOW; A-3-3-duplicate-row.png). Not submitted.
- [x] PASS brandA row remove "✕" (row 8) — 7 rows left: BLACK S/M/L, WHITE M/L, RED S/M (A-3-3-seven-variants.png)
- [x] PASS brandA "← Zurück" (step 2→1) — all step-1 values retained; "Weiter" ×2 → variants retained, reached Preis
- [x] PASS brandA "Brutto"/"Netto" price mode — price inputs cleared on each switch; Netto 50,00 → MwSt 9,50 → Endkundenpreis 59,50 (correct)
- [x] PASS brandA combobox "Region" — Deutschland/Europa/Global/USA each selected; ended Deutschland. NOTE (LOW): label still says "inkl. 19 % MwSt." for USA/Global
- [x] PASS brandA price "abc" + Weiter — "Gültigen Preis eingeben."
- [x] PASS brandA sale 99,00 > price 89,95 + Weiter — "Sale-Preis muss kleiner als der reguläre Preis sein". Error text stays visible after correcting to 69,95 until next Weiter (cosmetic)
- [x] PASS brandA price 89,95 / sale 69,95 — Netto 75,59 + MwSt 14,36 = 89,95. Hand check: 89,95/1,19 = 75,588 → 75,59; 89,95−75,59 = 14,36 ✓ (A-3-4-price.png). Listing response: discount net 58,78 + VAT 11,17 = 69,95 ✓
- [x] PASS brandA "← Zurück"/"Weiter: Look →" (step 3) — prices retained
- [x] PASS brandA checkbox "Eigenen Look … kuratieren" — reveals picker
- [x] PASS brandA textbox "Produkte durchsuchen…" — "zzz" → empty list; "Parka" → 1 result; cleared → all 5
- [x] PASS brandA look items "Enunas Aurora Parka","Enunas Cargo Pant" select (2/4), deselect Cargo (1/4)
- [x] PASS brandA "Überspringen" — advanced to review with "Übersprungen"; Zurück → checkbox unchecked, selection reset
- [x] PASS brandA re-select Parka + Cargo, "Weiter →" — review shows "Enunas Aurora Parka · Enunas Cargo Pant"
- [x] PASS brandA step 4 "← Zurück" → Preis, "Weiter: Look →" — look selection retained
- [x] PASS brandA review step — Name, Kategorie, Geschlecht UNISEX, HOODIE, Material, Herkunft, Pflege, Kollektion, 14 Tage, 7 Stk./35 Bestand, € 89,95 brutto · Sale € 69,95, Look, STREETWEAR (A-3-6-review.png). NOTE (LOW): review does not show Beschreibung, Release-Datum or Inspirationsgeschichte
- [x] PASS brandA review "← Zurück" / "Weiter →" — round trip OK
- [x] PASS brandA "Produkt erstellen" — POST /products/create 201 (id 30, slug e2e-0930-colour-hoodie), 7× POST /products/30/listings 201 (one per variant, DE, 89,95/69,95); edit panel opened automatically
- [x] FAIL brandA review copy "wird … zur Überprüfung eingereicht und muss … genehmigt werden" — product was created with status ACTIVE immediately (no PENDING). Either copy is wrong or approval gate is missing (MEDIUM; POST /products/create reqid 104 response status "ACTIVE")
- [x] FAIL brandA create response `colors[]` is empty — ProductColor ids only available via variants[].colorId (RED 40, WHITE 41, BLACK 42) (INFO)
- Console: only PostHog "initialized without a token" error (pre-existing, every page). No 4xx/5xx.

### Task 6 — Admin (page 2, isolatedContext admin) for P1
- [x] PASS admin "Produkte" (sidebar) — catalogue loaded (28 products); P1 listed with status AKTIV (was never PENDING, so no "Freigeben" button exists; approval step N/A)
- [x] FAIL admin textbox "Produkt, Marke oder SKU…" — typing `E2E-0930` crashes the whole admin page into the error boundary "Ein Fehler ist aufgetreten". Console: `TypeError: Cannot read properties of undefined (reading 'toLowerCase')` ×2. Cause: `app/(dashboard)/dashboard/admin/_components/Products.tsx:253` calls `p.sku.toLowerCase()` but admin products have no `sku` (the SKU column shows "—"). Any query that doesn't match the name/brand of every row reaches `p.sku` and throws. Recovered with "ERNEUT VERSUCHEN" (session kept). (HIGH for admin: product search unusable; A-6-admin-search-crash.png)
- [x] PASS admin "ERNEUT VERSUCHEN" — admin portal re-rendered on Übersicht, still logged in
- [x] PASS admin combobox "Alle Marken" → "Claude Testmarke 0109" — list filtered to that brand's 6 products
- [x] FAIL admin products table "PREIS" column — every product shows € 0,00, including P1 (listing 89,95/69,95) (LOW)
- [x] PASS admin "Bearbeiten" (P1) — inline editor opened: name, category, Unisex, description, material, care, collection, origin, catalogue Streetwear 1/3, story, and a read-only variants table with colours RED/WHITE/BLACK × sizes + SKUs (A-6-admin-p1-detail.png)
- [x] FAIL admin P1 detail images — "BILDER & VIDEOS" is one flat uploader with no per-colour grouping and no colour label on images (checked before uploads; per-colour images are not visible to admin as colourways) (LOW/INFO)
- [x] PASS admin "Abbrechen" — editor closed without changes
- NOTE admin Übersicht: "Top Marken" shows 0 PRODUKTE for every brand; "Letzte Aktivität" shows P1 "Produkt freigegeben · 2 STD." 10 minutes after creation (timezone offset, LOW)

### Task 4 — Per-colour images for P1 (brandA pageId 3, customer pageId 4)
- PDP path: `/bekleidung/claude-testmarke-0109/e2e-0930-colour-hoodie` (loads for anonymous customer context; default swatch = RED)
- NOTE: the prescribed `document.querySelectorAll('main img')` returns `[]` on the PDP — the PDP has no `<main>` element. Used `img[alt*="Ansicht"]` (gallery) instead. S3 keys are UUIDs, so comparison is against per-colour image ids below.
- [x] PASS customer RED check (before upload): swatches "Farbe RED/WHITE/BLACK auswählen" clicked; no /products/30/ images for any colour (A-4-red-pdp-black.png)
- [x] PASS brandA "Produktbilder" groups present: "Alle Farben (geteilt)", Rot, Weiß, Schwarz, each with its own dropzone
- [x] PASS brandA upload P1-SHARED.jpg → shared (1); "Tipp: Weise Bilder einer Farbe zu…" nudge appears
- [x] PASS brandA upload P1-BLACK-1/-2 → Schwarz (2); P1-WHITE-1/-2 → Weiß (2); P1-RED-1/-2 → Rot (2). Each: upload-url 200 → S3 PUT 200 → POST media/images 201; counters incremented (A-4-4-all-uploaded.png, A-4-4-groups-full.png)
- [x] PASS brandA dropzone reject 11.6 MB jpg — "Datei zu groß (max. 10 MB).", no request sent (A-4-4-reject-11mb.png)
- [x] PASS brandA dropzone reject .txt — "Nicht unterstütztes Format. Erlaubt: JPG, PNG, WebP.", no request (A-4-4-reject-txt.png)
- [x] PASS brandA product-list thumbnail updated without "Aktualisieren": SHARED after uploads; BLACK-2 after primary change/delete
- [x] PASS brandA hover + Star "Als Titelbild setzen" on P1-BLACK-2 — PATCH /media/images/34 200; TITEL moves to BLACK-2, which moves first in Schwarz (A-4-6-primary-black2.png)
- [x] PASS brandA Star on P1-RED-1 — RED-1 primary; BLACK-2 stays primary (one primary per colour group confirmed from GET media/images)
- [x] PASS brandA select on P1-RED-2 → "Weiß" (moves to Weiß group), → "Alle Farben (geteilt)" (moves to shared), → "Rot" (back) (A-4-7-red2-to-weiss.png)
- [x] PASS brandA throwaway upload (RED-1 copy, id 39) then hover + Trash "Bild löschen" — DELETE /media/images/39 204, tile removed, Rot back to 2 (A-4-8-after-delete.png). NOTE (LOW): no confirmation before deleting, and delete errors are swallowed silently (`ImagesSection.tsx:101` `catch { /* silent */ }`). The first click landed on the sticky header because the hover-revealed button sat under it; a second click after scrolling worked
- [x] PASS brandA "Tipp:" nudge visible with shared image + 3 colours
- [x] FAIL brandA wizard→first uploads: no image is primary until one is set by hand (all `primary:false`, no TITEL badge); WHITE still has no primary (INFO)
- [x] PASS customer GREEN check after reload (gallery ids, primary first):
  - RED   → RED-1*(2aba25c8), SHARED(6957fd92), RED-2(0c8098af) (A-4-green-red.png)
  - WHITE → SHARED(6957fd92), WHITE-1(0b6d86f0), WHITE-2(91304ae9) — no primary set, so shared comes first (A-4-green-white.png)
  - BLACK → BLACK-2*(6badffdc), SHARED(6957fd92), BLACK-1(b1a2ac30) (A-4-green-black.png, label "P1-BLACK-2" visible)
  - No other colour's images appear in any set.
- NOTE (LOW): the "Outfit" image in the Look section always shows BLACK-2 (product primary), even when RED/WHITE is selected. The swatch click does not update the URL with `?color=`.
- Image ids: SHARED 32 · BLACK-1 33 · BLACK-2 34 (primary) · WHITE-1 35 · WHITE-2 36 · RED-1 37 (primary) · RED-2 38 · (throwaway 39 deleted)
- NOTE (perf): every image action refetches listings + variants for ALL 6 brand products (~13 requests)

### Task 5 Step 1 — P2 "E2E-0930 Fallback Tee" (brandA pageId 3)
- [x] PASS brandA "Neues Produkt" → step 1: name, description, Unisex, T SHIRT, 14 days, material/origin/care, release 29.09.2026, catalogue Athleisure → "Weiter"
- [x] PASS brandA step 2: Blau + M,L → "2 Varianten hinzufügen (Blau)"; Grün + M → "1 Variante…"; 3 rows (BLUE M/L, GREEN M), stock 5 → "Weiter: Preis"
- [x] PASS brandA step 3: Brutto, Deutschland, 39,95, no sale → "Weiter: Look"
- [x] PASS brandA step 4: "Weiter →" without curation; review shows "€ 39,95 brutto", 3 Stk./15 Bestand, ATHLEISURE
- [x] PASS brandA "Produkt erstellen" — POST /products/create 201 (id 31, slug e2e-0930-fallback-tee, status ACTIVE, preview false); 3× POST /products/31/listings 201
- [x] PASS brandA upload P2-BLUE-1.jpg → Blau (image 40), P2-SHARED.jpg → shared (image 41); GREEN has no images. "Tipp" nudge shown
- [x] PASS admin P2 listed as AKTIV (visible only after leaving and re-entering "Produkte"; clicking "Produkte" while already on it does not refetch). No approval needed
- [x] PASS admin P1 "Bearbeiten" after uploads: all 7 images listed flat under "BILDER & VIDEOS" with no colour labels or grouping, and "Bild löschen" on each (A-6-admin-p1-images-flat.png) — see the FAIL for no per-colour view above
- [x] PASS customer P2 PDP `/bekleidung/claude-testmarke-0109/e2e-0930-fallback-tee`: BLUE → [BLUE-1, SHARED]; GREEN → [P2-SHARED] only (fallback, not empty, no BLUE) (A-5-p2-green-fallback.png)

### Phase A summary
- PASS 64 · FAIL 8 (1 HIGH, 1 MEDIUM, 4 LOW, 2 INFO)
- HIGH: admin product search crashes the admin page (`p.sku.toLowerCase()` on undefined)
- MEDIUM: the wizard says products go to review, but the backend creates them ACTIVE right away
- LOW: return period 31 accepted without an error; duplicate variant row with no warning; admin price column € 0,00; admin images are not grouped by colour
- INFO: no primary image by default (WHITE has none)
- INFO: create response `colors[]` empty. Plan note (not counted): the PDP has no `<main>`, so the plan's gallery script returns []

## Phase B

### Task 5 Step 2 — P3 "E2E-0930 Brand B Trouser", brandB tab (pageId 5, isolatedContext brandB)
- [x] PASS brandB "Einloggen" (dashboard/login) — davidemmanuel.konan+enunas0109b@gmail.com → /dashboard/vendor, sidebar "Claude Testmarke 0109B · AKTIV"
- [x] PASS brandB "Produkte" — list rendered (3 existing products)
- [x] PASS brandB "Neues Produkt" step 1 — name, description, PANTS, 14 Tage, material/origin/care/collection, release 29.09.2026, catalogue Streetwear, story → "Weiter"
- [x] PASS brandB step 2 — Beige + M,L, stock 5 → "2 Varianten hinzufügen (Beige)" → 2 rows
- [x] PASS brandB step 3 — Brutto, Deutschland, 59,95, no sale. Breakdown Netto 50,38 + MwSt 9,57 = 59,95 (hand check 59,95/1,19 = 50,378 → 50,38 ✓)
- [x] PASS brandB step 4 "Weiter →" (no curation) → review
- [x] FAIL brandB gender "Herren" → "Produkt erstellen" — POST /products/create **400** `Invalid value 'MALE' for 'gender'. Allowed values: [UNISEX, MEN, WOMEN, OTHER]` (reqid 90). Error text shown in review, product not created. (**HIGH**: brands cannot create any men's product.) Cause: `app/(dashboard)/dashboard/vendor/_components/products/constants.ts:15-16` sends `MALE`/`FEMALE`; the backend enum is `MEN`/`WOMEN`. Same wrong values in the admin editor `app/(dashboard)/dashboard/admin/_components/Products.tsx:42-43`. Repro: wizard step 1 click "Herren", fill the rest, submit on step 5. (BC-B-herren-400.png)
- [x] FAIL brandB gender "Damen" → "Produkt erstellen" — same 400 `Invalid value 'FEMALE' for 'gender'` (**HIGH**, same root cause). Review step also shows raw "MALE"/"FEMALE" instead of German labels (LOW)
- [x] PASS brandB "← Zurück" ×4 from review to step 1 — all values (variants, price) retained; stale 400 message cleared after navigating
- [x] PASS brandB gender "Unisex" → "Produkt erstellen" — POST /products/create 2xx: id **32**, slug `e2e-0930-brand-b-trouser`, status ACTIVE, preview false, gender UNISEX; 2 listings DE 59,95 (BEIGE/M, BEIGE/L, SKU 565X1ER9); edit panel opened with groups "Alle Farben (geteilt)" and "Beige"
- [x] PASS brandB upload P3-BEIGE-1.jpg → Beige dropzone — upload-url 200 → S3 PUT 200 → POST media/images 201 (image 42, colorId 45, key f990c623); Beige counter 0→1 (BC-B-p3-created-beige.png)
- [x] FAIL brandB P3-BEIGE-1 not primary after upload (`primary:false`, no TITEL badge) — same as Phase A INFO (INFO, not re-counted)
- Console: PostHog token error (pre-existing) + the two 400s above.

## Phase C

### Task 7 — Storefront, customer tab (pageId 4, isolatedContext customer), logged out, desktop 1440×900
Image ids: P1 RED-1 2aba25c8 · WHITE-1 0b6d86f0 · WHITE-2 91304ae9 · BLACK-1 b1a2ac30 · BLACK-2 6badffdc · SHARED 6957fd92 · RED-2 0c8098af; P2 BLUE-1 6c856b38 · SHARED 880fbff9; P3 BEIGE-1 f990c623.

**Step 1 — Discovery surfaces**
- [x] PASS customer `/` "Unsere Favoriten" — P1 shown (BLACK-2, brand, 69,95). P2/P3 absent (section = first 8 of `GET /products?size=8`, not a newest list)
- [x] FAIL customer `/` "Neue Arrivals" — P2 and P3 (the two newest products) are missing; P1 shown. `NewProducts.tsx:17` fetches `productApi.list({ size: 8 })` (backend default order, ids 24,8,26,27,25,28,29,30), then sorts only those 8 by `createdAt`. Anything past the first 8 never appears as "new". Same pattern in `PopularProduct.tsx:17` (MEDIUM; BC-C-home-neue-arrivals.png)
- [x] PASS customer `/` "Das könnte dir auch gefallen" — P1 with 69,95 and struck 89,95
- [x] FAIL customer `/` "Unsere Favoriten"/"Neue Arrivals" P1 card — the struck-through 89,95 is missing (only 69,95), unlike /bekleidung and the PDP (LOW; BC-C-home-neue-arrivals.png)
- [x] FAIL customer `/` P1 card — the swatch shown is RED but the image is BLACK-2 (the product primary), and the click opens the PDP on RED. Card image, swatch and landing colour disagree (LOW; BC-C-home-neue-arrivals.png)
- [x] PASS customer `/` P1 card click ("Neue Arrivals") → `/bekleidung/claude-testmarke-0109/e2e-0930-colour-hoodie`, gallery RED-1*, SHARED, RED-2
- [x] PASS customer navbar "Suche öffnen" + type `E2E-0930` — 3 results: P1 69,95 (Claude Testmarke 0109, img BLACK-2), P2 39,95 (0109, BLUE-1), P3 59,95 (0109B, BEIGE-1) (BC-C-search-e2e0930.png)
- [x] PASS customer search result P3 click → P3 PDP
- [x] PASS customer search `Colour Hoodie` → 1 result (P1); "ALLE ERGEBNISSE FÜR …" → `/bekleidung?q=Colour%20Hoodie`, 1 ARTIKEL (P1)
- [x] PASS customer search `xxxxxxx` → "Keine Ergebnisse. Für „xxxxxxx“ wurden keine Artikel gefunden." + highlight links (BC-C-search-empty.png); Escape closes
- [x] PASS customer `/bekleidung` — 10 ARTIKEL; P1 (BLACK-2, 69,95 + 89,95 struck), P2 (BLUE-1, 39,95), P3 (BEIGE-1, 59,95, brand 0109B). One card per product here (`bekleidung/page.tsx` uses `apiProductToCardShape`, not colourway cards). P2 card click → P2 PDP
- [x] PASS customer `/bekleidung/claude-testmarke-0109` → redirects to `/marken/claude-testmarke-0109`
- [x] PASS customer `/bekleidung/claude-testmarke-0109b` → `/marken/claude-testmarke-0109b`: 10 ARTIKEL, P3 (BEIGE-1, 59,95, "new in"); card click → P3 PDP
- [x] PASS customer `/marken` — both "Claude Testmarke 0109" and "Claude Testmarke 0109B" listed under C
- [x] PASS customer `/marken/claude-testmarke-0109` — 12 ARTIKEL, P1 ×3 colour cards + P2 ×2 colour cards; P3 NOT listed ✓. Brand header "Kuratierte Pieces von Claude Testmarke 0109 …" (generic copy, no bio)
- [x] NOTE customer `/angebot/claude-testmarke-0109` — 404. Not a real surface: only `/angebot/[brand]/[slug]` exists, and it's the post-purchase upsell behind `NEXT_PUBLIC_ENABLE_UPSELL` (off in prod), so `/angebot/…/e2e-0930-colour-hoodie` is also 404. The plan expectation is wrong; no discount listing page exists (INFO, not counted)
- [x] FAIL customer `/bekleidung/streetwear` — P1 and P3 (both STREETWEAR) are missing; 6 older products shown. `/bekleidung/athleisure` — P2 (ATHLEISURE) missing. Cause: `app/(root)/bekleidung/components/CatalogueLandingPage.tsx` is an async server component with no `revalidate`/dynamic marker, so Vercel serves a build-time prerender (`x-vercel-cache: PRERENDER`, `x-nextjs-prerender: 1`, reqid 1400). New products only show after a redeploy (**HIGH** for brands: new products never reach the catalogue pages)
- [x] PASS customer `/bekleidung/cultural` (2), `/experimental` (0), `/star` (2) — load, no broken images; none of P1–P3 belong there
- [x] FAIL customer `/bekleidung/catalogue` → caught by the `/bekleidung/[brand]` redirect → `/marken/catalogue`, which renders a fake brand page "Kuratierte Pieces von catalogue — 0 ARTIKEL" (LOW). `/marken/<anything>` renders a brand page instead of 404 (LOW). `/bekleidung/catalogue/streetwear` → 404 (the `catalogue/[catalogue]` folder is empty)
- [x] PASS customer `/catalogue` — 5 catalogue tiles + "Das könnte dir auch gefallen" with P1 (BLACK-2); P2/P3 absent (same first-8 fetch)
- [x] PASS customer `/neu` — 18 ARTIKEL (colourway cards): P1 RED/WHITE/BLACK, P2 BLUE/GREEN, P3; prices correct
- [x] FAIL customer `/neu` order — the default sort "Neuheiten" doesn't sort: the newest products (P1–P3) come last, after Cargo/Terra/Drift/Nomad. `FeedPageContent.tsx:114-116` only sorts for preis/name (LOW)
- [x] PASS customer `/trendy` — 18 ARTIKEL; P1 ×3, P2 ×2, P3 present with correct images/prices
- [x] PASS customer `/drop` — "The Drops Are Coming" placeholder, no products (by design; INFO)

**Step 2 — Per-colour cards** (`/marken/<brand>`, `/neu`, `/trendy`)
- [x] PASS P1 cards: RED → RED-1, WHITE → WHITE-1, BLACK → BLACK-2 (each colour's own cover)
- [x] FAIL P2 GREEN card shows the **BLUE** photo (P2-BLUE-1), although the PDP shows P2-SHARED for GREEN. `lib/colourwayImage.ts` `colourwayCoverImage` falls back to `product.images[0]` (another colour's image) when a colourway has no own images, instead of a shared image. The same helper feeds cart/checkout thumbnails (MEDIUM; BC-C-marken-a-green-card-blue-image.png). Seen on /marken/claude-testmarke-0109, /neu, /trendy
- [x] PASS click P1 RED card → `?color=RED`, RED pressed, gallery RED-1*, SHARED, RED-2
- [x] PASS click P1 WHITE card → `?color=WHITE`, WHITE pressed, gallery SHARED, WHITE-1, WHITE-2; S disabled (BC-C-white-card-pdp.png)
- NOTE: colour names are backend enums (RED/WHITE/BLACK), so no umlaut (`Weiß`) ever reaches `?color=`. The umlaut path can't be exercised. The PDP also shows English enum names ("WHITE") in a German UI (LOW)

**Step 3 — P1 PDP**
- [x] PASS swatch RED → [RED-1*, SHARED, RED-2], SKU 6TAITLRJ, sizes S,M (L disabled)
- [x] PASS swatch WHITE → [SHARED, WHITE-1, WHITE-2], SKU KKURR8V2, S disabled
- [x] PASS swatch BLACK → [BLACK-2*, SHARED, BLACK-1], SKU 3RF05V2K, S/M/L enabled
- [x] PASS BLACK + size S selected → switch to WHITE → no size selected, CTA back to "Größe wählen" (BC-C-p1-white-size-reset.png)
- [x] PASS thumbnails "Zu Bild 3/2/1 scrollen" — active dot moves, image scrolls (WHITE-1 shown)
- [x] FAIL "Bild vergrößern" (zoom) when the page is scrolled even ~70px: the zoom button (top:12px of the gallery) and the gallery "Zu Favoriten hinzufügen" button sit under the fixed header, so the click lands on the header (the favourite click hit the "Enunas" logo and went to `/`). At scrollY 0 both work (MEDIUM; BC-C-p1-zoom.png). Fix area: `ImageGallery.tsx` button offsets vs the fixed header
- [x] PASS zoom at top → full-width viewer opens (6 images in DOM, body overflow hidden) (BC-C-p1-zoom-open.png); Escape closes it
- [x] FAIL ArrowLeft/ArrowRight — no keyboard navigation on the gallery or in the zoom viewer (only Escape is handled) (LOW)
- [x] PASS price 69,95 € with 89,95 € struck + "REDUZIERT −22 %" (69,95/89,95 = 0,778 → −22 % ✓)
- [x] PASS brand link "CLAUDE TESTMARKE 0109" → /marken/claude-testmarke-0109; breadcrumb too
- [x] PASS gender badge "UNISEX"; catalogue tag "Streetwear" → /bekleidung/streetwear; inspiration "Test story"; collection "E2E Herbst 2026"
- [x] FAIL size guide — no size-guide row; `SizeGuideRow` is commented out in `ProductDetails.tsx:538` ("hidden for beta") (INFO)
- [x] PASS "Vervollständige den Look 2 Artikel" — Aurora Parka (Coming Soon) + Cargo Pant, both links. NOTE: the "Outfit" image is always BLACK-2 regardless of colour (known from Phase A)
- [x] PASS "Mehr von Claude Testmarke 0109" lists P2 (BLUE-1, 39,95)
- [x] PASS favourite (logged out, at scrollY 0) → redirects to `/account` login; wishlist stays empty. NOTE (LOW): no return URL, so after login the shopper isn't sent back to the product

**Step 4/5 — P2 and P3 PDP**
- [x] PASS P2 BLUE → [BLUE-1, SHARED]; GREEN → [P2-SHARED] only (fallback, no BLUE, not empty), SKU BI9FOQCV, M only (BC-C-p2-green-fallback.png)
- [x] PASS P3 PDP `/bekleidung/claude-testmarke-0109b/e2e-0930-brand-b-trouser` — gallery [BEIGE-1], BEIGE pressed, 59,95 €, sizes M/L, SKU 565X1ER9, brand links → /marken/claude-testmarke-0109b (BC-C-p3-pdp.png). Its auto "Complete the look" shows Brand A items (cross-brand, by category)

**Console (desktop, all pages above):** only PostHog "initialized without a token" (pre-existing) and 4× "preloaded using link preload but not used" warnings for the ufs.sh hero assets on `/` (LOW). No hydration warnings, no 4xx/5xx on product APIs.

**Step 6 — Customer login and saved lists** (customer tab, pageId 4)
- [x] PASS customer `/account` "E-Mail"/"Passwort"/"Anmelden" — davidemmanuel.konan+kunde0903@gmail.com logged in ("Guten Tag, David", 6 Bestellungen, 0 Wunschliste); cart empty
- [x] PASS customer P1 PDP: WHITE → RED, then "Zu Favoriten hinzufügen" → "Von Favoriten entfernen"; stored image RED-1 (2aba25c8)
- [x] PASS customer P3 PDP "Zu Favoriten hinzufügen" → saved with BEIGE-1 (f990c623)
- [x] PASS customer `/saved-lists` "Deine Favoriten 2 ARTIKEL": P1 (RED-1, RED, 69,95 / 89,95 struck), P3 (BEIGE-1, BEIGE, 59,95, 0109B) (BC-C-saved-lists.png)
- [x] PASS customer `/saved-lists` "Von Favoriten entfernen" (P1) → 1 ARTIKEL; re-add from the PDP with WHITE selected stores WHITE-1 (per-colour image ✓); removed again and re-added with RED → final list P3 + P1 (RED-1)
- [x] FAIL saved item link has no `?color=` (`href: /bekleidung/…/e2e-0930-colour-hoodie`), so a WHITE favourite (WHITE-1 thumbnail) opens the PDP on RED (LOW)
- NOTE (INFO): the wishlist lives only in localStorage `enunas_wishlist` (no `/wardrobe` API call), so favourites don't follow the account across devices
- [x] PASS the PDP favourite button showed "did not become interactive" twice via a stale snapshot uid; it worked after a fresh snapshot (tooling, not an app bug)

**Mobile 390×844 (emulated, touch)**
- [x] PASS `/` — scrollWidth 390 = innerWidth (no overflow), 0 broken images, P1 cards present (BC-C-mobile-home.png)
- [x] FAIL `/` tap targets — header icons (Menü, Suche, Konto, Wunschliste, Warenkorb) are 20×20 px, and Instagram/TikTok 16–17 px, below the 24 px minimum (44 px recommended) (LOW)
- [x] PASS `/bekleidung` — no overflow, 0 broken, P1 (BLACK-2), P2 (BLUE-1), P3 (BEIGE-1) at 173 px wide (BC-C-mobile-bekleidung.png)
- [x] PASS P1 PDP — no overflow, gallery RED [RED-1, SHARED, RED-2]; tap BLACK → [BLACK-2, SHARED, BLACK-1], SKU 3RF05V2K, 69,95/89,95 −22 % (BC-C-mobile-pdp-black.png)
- [x] FAIL P1 PDP gallery dots "Zu Bild n scrollen" are 6–10 px tap targets (LOW)
- [x] PASS `/marken/claude-testmarke-0109` — no overflow, 0 broken, P1 ×3 + P2 ×2 colour cards (GREEN still shows BLUE-1, same MEDIUM bug) (BC-C-mobile-marken-a.png)
- [x] PASS search `E2E-0930` — full-width dialog (390), 3 results with images loaded, no overflow (BC-C-mobile-search.png)
- Console (mobile): only the PostHog token error
- Viewport restored to 1440×900 (desktop, no touch) on the customer tab

### Phase B + C summary
- Phase B: PASS 9 · FAIL 3 (2 HIGH with one root cause: gender `MALE`/`FEMALE` vs backend `MEN`/`WOMEN`; 1 INFO repeat: no default primary image)
- Phase C: PASS 45 · FAIL 13 ledger lines (1 HIGH, 3 MEDIUM, 8 LOW, 1 INFO; a few LOW items are listed as NOTEs)
  - HIGH: catalogue landing pages (`/bekleidung/streetwear|athleisure|…`) are build-time prerenders, so new products never appear (`CatalogueLandingPage.tsx`)
  - MEDIUM: homepage "Neue Arrivals" only considers the first 8 products from the API, so the newest products are missing (`NewProducts.tsx:17`, also `PopularProduct.tsx:17`)
  - MEDIUM: a colourway with no own images shows another colour's photo on colour cards (P2 GREEN → BLUE-1) (`lib/colourwayImage.ts` fallback)
  - MEDIUM: PDP zoom and favourite buttons sit under the fixed header once the page scrolls a little; clicks hit the header/logo (`ImageGallery.tsx`)
  - LOW: struck price missing on the homepage Favoriten/Neue Arrivals cards; homepage P1 card swatch RED vs image BLACK; `/neu` not sorted newest-first; `/bekleidung/catalogue` → fake brand page `/marken/catalogue`; no gallery arrow keys; English colour enums in the German UI; the saved item loses `?color`; tap targets under 24 px (header icons, gallery dots); unused preload warnings
  - INFO: `/angebot/<brand>` doesn't exist (upsell flag off); no size-guide row (commented out); `/drop` is a placeholder

## Phase D

Step 0: aborted earlier run left the full Task 8 cart (4 lines) in localStorage and no orders today (newest ENS-2026-4L7JX2, 14 Sep). Emptied via sidebar "Entfernen" ×4 (D-0-account-orders.png). See state "Phase D leftovers".

### Task 8 — multi-brand cart
- [x] PASS customer P1 PDP "Farbe BLACK auswählen" + "M" + "Zum Warenkorb hinzufügen" — line BLACK M ×1, listing 68, img 6badffdc = P1-BLACK-2 (primary); sidebar auto-opens (D-8-1-add-black-m.png)
- [x] PASS customer P1 "Farbe RED auswählen" + "S" + add ×2 — second add merged into one line qty 2 (listing 63, img 2aba25c8 = P1-RED-1); did NOT merge with the BLACK line
- [x] PASS customer P2 "Farbe GREEN auswählen" + "M" + add — line GREEN M, listing 72, thumbnail 880fbff9 = **P2-SHARED** (GREEN has no own image; the fallback is the shared image, not BLUE — correct, unlike the known card bug)
- [x] PASS customer P3 "BEIGE" + "L" + add — line BEIGE L, listing 74, img f990c623 = P3-BEIGE-1
- [x] PASS customer sidebar 4 separate lines, thumbs BLACK-2 / RED-1 / P2-SHARED / BEIGE-1; Zwischensumme 309,75 €, Versand 10,00 € (5 € × 2 brands), Gesamt 319,75 €, badge 5 (D-8-2-sidebar-4-lines.png)
- [x] PASS customer sidebar "Menge erhöhen" GREEN → 2 / 79,90 €, subtotal 349,70 €; "Menge verringern" → 1; "−" disabled at qty 1
- [x] PASS customer sidebar "Entfernen" BEIGE — line removed, shipping drops to 5,00 € (one brand), total 254,80 €; re-added from P3 PDP → back to 4 lines
- [x] PASS customer sidebar close via "Schließen" ✕, via Escape (panel translated off-screen) and via overlay click (click landed on overlay, menu not opened) (D-8-2-overlay-click.png)
- [x] FAIL customer sidebar tab "Wunschliste" — always shows "0" / "Noch nichts gemerkt" although the header says "Wunschliste mit 2 Artikeln" and localStorage `enunas_wishlist` holds 2 items. The count is hardcoded: `CartSidebar.tsx:499` `Wunschliste<span className="enu-tab-n">0</span>` (LOW; D-8-2-sidebar-wishlist-tab-empty.png). Repro: favourite any product, open cart sidebar, click "Wunschliste".
- [x] PASS customer /cart — 4 lines with the same per-colour thumbs (6badffdc, 2aba25c8, 880fbff9, f990c623), brand names, "Farbe:/Größe:" labels; hand check 69,95 + 2×69,95 + 39,95 + 59,95 = 309,75 € = Zwischensumme; +10,00 € = 319,75 € (D-8-3-cart-page.png)
- [x] PASS customer /cart "Menge erhöhen" RED → 3 / 209,85 €, subtotal 379,70 €; "Menge verringern" → 2
- [x] FAIL customer /cart "Menge verringern" at qty 1 (BEIGE) — silently **removes the line** (no confirm), while the sidebar disables "−" at qty 1. Inconsistent qty-1 behaviour between sidebar and cart page (LOW/INFO)
- [x] PASS customer /cart "Das könnte dir gefallen" renders 8+ cards incl. coming-soon countdowns, no console errors except the known PostHog token warning (P2 card there shows BLUE-1 — known Phase C card bug, not re-counted)
- [x] PASS customer colour switch: P1 PDP WHITE + M + add → new 4th line WHITE M, listing 65, thumb 0b6d86f0 = P1-WHITE-1 (not BLACK); removed again via sidebar "Entfernen" (D-8-4-white-line.png)
- [x] PASS customer reload → cart persists: 4 lines, same images, badge 5

### Task 9 — checkout (ORDER-1)
- [x] PASS customer /checkout loads logged in (auth gate skipped), "E-Mail-Adresse" prefilled; Bestellübersicht 4 lines with per-colour thumbs (BLACK-2, RED-1 ×2, P2-SHARED, BEIGE-1), brand names, P1 at sale price 69,95, Zwischensumme 309.75, "Versand — Claude Testmarke 0109 · Standard 5.00" + "… 0109B 5.00", Gesamt 319.75 (D-9-1-checkout.png)
- [x] FAIL customer /checkout Bestellübersicht money format — "€69.95", "€309.75", "€319.75" (English format, dot decimal) while cart/sidebar/confirmation use "69,95 €"/"€69,95" (LOW; D-9-1-checkout.png)
- [x] PASS customer saved-address radio "STANDARD David Konan … Berlin" selectable; after adding a 2nd address both radios selectable; "BEARBEITEN" opens "Adresse bearbeiten" prefilled, "ABBRECHEN" returns to the selector
- [x] FAIL customer "Adresse bearbeiten" form has no "TELEFONNUMMER" field although the add form has one; and the phone typed in the new-address form (+491701234567) is not stored — order shippingAddress.phone = null (LOW)
- [x] PASS customer "+ NEUE ADRESSE HINZUFÜGEN" form — VORNAME, NACHNAME, STRASSE, HAUSNUMMER, ADRESSZUSATZ, PLZ, STADT, TELEFON, "speichern" checkbox, LAND disabled "Deutschland" with DE-only note; "Adresse verwenden" → POST /customer/addresses 201, card "✓ Für zukünftige Bestellungen gespeichert"; "ANDERE ADRESSE VERWENDEN" back to selector
- [x] PASS customer STRASSE autocomplete "Marienplatz" — 5 Google Places suggestions on production (Places AutocompletePlaces 200); picking "München-Altstadt-Lehel" fills PLZ 80331 + STADT München (D-9-1-autocomplete.png)
- [x] PASS customer PLZ "12" → inline "Bitte eine gültige 5-stellige PLZ eingeben.", not submitted; "80331" accepted (D-9-1-plz-12.png). NOTE: input maxLength is 16 (an autofilled value + typing produced "8033112"); validation still catches it
- [x] FAIL customer "Gutscheincode" invalid "E2EINVALID" → "ANWENDEN" shows raw English backend text "Discount code not found: E2EINVALID" (LOW), **and the rejected code stays in state: after clearing the input, "Zur Zahlung" still POSTs /orders with `"discountCode":"E2EINVALID"` → 400 twice (reqid 4883, 4884), so the customer cannot pay**. Only clicking "ANWENDEN" again with an empty field clears it (MEDIUM; D-9-1-stale-coupon-blocks-order.png). Repro: /checkout → type any bogus code → ANWENDEN → clear field → Zur Zahlung.
- [x] PASS customer "Zur Zahlung" → POST /orders 201 (body: listings 68×1, 63×2, 72×1, 74×1, savedAddressId 7) → Mollie hosted checkout "Enunas order ENS-2026-1TWSCJ", 319,75 €, test-mode notice
- [x] PASS customer Mollie "PayPal" → test page → "Bezahlt" → "Weiter" → redirected to /orders/ENS-2026-1TWSCJ/confirmation; cart emptied (badge 0)
- [x] PASS customer confirmation "Vielen Dank." — order number, date, 4 lines with correct colour thumbs (6badffdc, 2aba25c8, 880fbff9, f990c623), per-brand shipping 5,00 + 5,00, Zwischensumme €309,75, Gesamt €319,75 (D-9-3-confirmation.png)
- [x] FAIL customer confirmation RED S line shows "€69,95" with no quantity — the ×2 is missing (API: qty 2, lineTotal 139.90), so the visible lines add up to 239,80 but the subtotal says 309,75 (LOW/MEDIUM; D-9-3-confirmation.png)
- [x] FAIL customer confirmation "LIEFERADRESSE" shows only "Marienplatz / 80331 München" — no name, no house number "1", no Adresszusatz (API shippingAddress has all of them) (LOW)
- [x] PASS customer "MEINE BESTELLUNGEN ANSEHEN" → /account overview "Letzte Bestellung ENS-2026-1TWSCJ BEZAHLT 319,75 €"; BESTELLUNGEN tab row expands: 4 lines with per-colour thumbs, "S · RED · ×2 139,90 €", "Versand — Claude Testmarke 0109 5,00 €" and "… 0109B 5,00 €" (D-9-4-account-order-detail.png)
- [x] FAIL customer /account order detail — item lines carry no brand name and are not grouped by brand; brands appear only in the two shipping lines (LOW)
- [x] PASS API order 27 ENS-2026-1TWSCJ status PAID, paidAt 20:06:49, subtotal 309.75, shipping 10.00, total 319.75, item images per colour, shippingSnapshots 5+5 per brand

### Task 9 — failed / canceled / ORDER-2
- [x] PASS customer P2 BLUE M only → sidebar "Sicher zur Kasse" → /checkout (standard Berlin address preselected, summary thumb 6c856b38 = P2-BLUE-1, 39.95 + 5.00 = 44.95) → "Zur Zahlung" → Mollie ENS-2026-FPRD0G 44,95 €
- [x] FAIL customer Mollie "Fehlgeschlagen" → "Weiter" does **not** return to Enunas: Mollie shows its method-selection page again (retry). The customer only gets back via "‹ Vorherige Seite" (D-9-fail-mollie-after-failed.png). Likely Mollie hosted-checkout behaviour for payments created without a fixed method; Enunas never sees a failed status (INFO/MEDIUM — backend payment creation, not frontend)
- [x] PASS customer "‹ Vorherige Seite" → /orders/ENS-2026-FPRD0G/confirmation: "Zahlung wird geprüft…" then "Zahlung noch nicht bestätigt. Falls du die Zahlung abgebrochen hast, wird die Bestellung innerhalb von 30 Minuten automatisch storniert … Deine Artikel liegen weiterhin im Warenkorb." + "Zum Warenkorb" + "STATUS ERNEUT PRÜFEN" (re-polls /orders/me); cart kept (BLUE M, badge 1) (D-9-fail-landing.png)
- [x] PASS customer /account BESTELLUNGEN — ENS-2026-FPRD0G listed as "ZAHLUNG AUSSTEHEND" 44,95 € (API status PENDING, paidAt null). No failure status is ever shown (see FAIL above)
- [x] PASS customer same cart → /cart "Zur Kasse" → "Zur Zahlung" → Mollie ENS-2026-TK3E1I → "Abgebrochen" → "Weiter" → again back to Mollie method selection (same behaviour as Failed; D-9-cancel-mollie-after-canceled.png) → "‹ Vorherige Seite" → same "Zahlung noch nicht bestätigt." page, cart kept (D-9-cancel-landing.png); API status PENDING
- [x] FAIL customer retrying checkout after a failed/canceled payment creates a **second** PENDING order for the same cart (FPRD0G and TK3E1I both PENDING for BLUE M) instead of reusing the open one; relies on the 30-min auto-cancel to clean up (LOW/INFO; verify auto-cancel + stock release later)
- [x] PASS customer ORDER-2: removed BLUE M via sidebar, P2 BLUE L added → checkout → Mollie PayPal "Bezahlt" → /orders/ENS-2026-1PV2Y8/confirmation "Vielen Dank.", 1 line "L · BLUE" thumb P2-BLUE-1, €39,95 + €5,00 = €44,95; cart emptied (D-9-order2-confirmation.png). API id 30 PAID 20:14:54. Confirmation address again shows only "Teststraße / 10115 Berlin" (no name / house number — same FAIL as ORDER-1, not re-counted)

Phase D totals: PASS 28 · FAIL 10 (1 MEDIUM stale coupon blocks payment; 1 INFO/MEDIUM Mollie failed/canceled never reach Enunas; 8 LOW/INFO). End state: customer tab logged in, cart empty, on /orders/ENS-2026-1PV2Y8/confirmation.

## Phase E

### Task 10 Step 1 — Brand A Übersicht (brandA pageId 3)
- [x] PASS KPI "Warenumsatz MTD" 789,50 € (abzgl. 419,80 € Erstattungen) — hand-check from GET /brand/orders: PAID 689,55 + REFUNDED 319,85 + RETURN_RECEIVED 199,90 = 1209,30 − 419,80 = 789,50; includes ORDER-1 Brand A part 249,80 (subtotal, no P3) and ORDER-2 39,95; PENDING FPRD0G/TK3E1I excluded (E-1-uebersicht.png)
- [x] PASS KPI "Offen" 6 = PAID count (OOT2JR, WJM98N, 4L7JX2, KPOV6I, 1TWSCJ, 1PV2Y8); "Versanderlöse MTD 54,96 €" = 4×4,99 + 7×5,00 ✓
- [x] PASS chart "Umsatzverlauf" 30.9 point ≈ 289,75 (249,80 + 39,95); "Umsatz-Mix" donut Streetwear/Athleisure — legends are static text, no period toggles exist (nothing clickable)
- [x] FAIL "Offene Punkte" lists only the 3 OLDEST paid orders (OOT2JR, WJM98N, 4L7JX2); the new ORDER-1 (and ORDER-2, KPOV6I) never appear although "Offen" says 6 (LOW; E-1-uebersicht.png). Likely `app/(dashboard)/dashboard/vendor/_components/…Overview*` slices the unsorted list to 3
- [x] PASS "VERSENDEN →" ×3 — each switches to the Bestellungen tab (onNavigate); does not pre-open the specific order (INFO)
- [x] PASS "VOLLSTÄNDIGE ANALYSE" → Analytics tab. Console: only PostHog "initialized without a token" error (known env)

### Task 10 Step 2 — Brand A Bestellungen
- [x] PASS chip "Alle" 11 rows (PENDING/CANCELLED hidden) · "Versandbereit" 6 PAID rows · "Versandt" 2 · "Geliefert" 0
- [x] FAIL chip "Rückgabe" and KPI "RÜCKGABEN 0" — empty, but O24AUN and TFZNYE are RETURN_RECEIVED (API) and are shown as "VERSANDT" under the Versandt chip. RETURN_* statuses are mapped to Versandt (LOW/MEDIUM; E-2-rueckgabe-filter-empty.png). Likely the status→chip mapping in the vendor Fulfillment component
- [x] PASS search "ENS-2026-1TWSCJ" → 1 row · "Fallback Tee" → 1PV2Y8 + 1TWSCJ · "München" → 5 rows incl. 1TWSCJ · "zzz" → "KEINE BESTELLUNGEN GEFUNDEN."
- [x] FAIL chrome `fill("")` on the search box does not clear it (value stays "zzz") — tooling note, cleared with Ctrl+A/Backspace (INFO, not a product bug)
- [x] PASS "Aktualisieren" → refetches GET /brand/orders (keeps filter)
- [x] PASS ORDER-1 row: € 254,80 = Brand A subtotal 249,80 + Brand A shipping 5,00 (not the customer total 319,75); thumbs BLACK-2 (6badffdc), RED-1 (2aba25c8), P2-SHARED (880fbff9)
- [x] PASS ORDER-1 expand: exactly 3 lines "Colour Hoodie — M / BLACK × 1 € 69,95", "— S / RED × 2 € 139,90", "Fallback Tee — M / GREEN × 1 € 39,95"; no P3 / Brand B anywhere (E-2-order1-brandA-detail: see E-2-problem-submitted.png)
- [x] FAIL ORDER-1 LIEFERADRESSE (expanded row AND "Versand bestätigen" modal) shows "Marienplatz / 80331 München" — house number "1" and Adresszusatz "E2E Phase D" missing although the brand API returns houseNumber:"1", addressLine2. A brand would ship to an incomplete address (MEDIUM; E-2-ship-modal-order1.png). Same root as the Phase D confirmation FAIL (address formatter ignores houseNumber/addressLine2)
- [x] PASS "Problem melden" on ORDER-1 → modal "PROBLEM MELDEN ENS-2026-1TWSCJ", submit disabled while empty, typed text, "Abbrechen" closes, no request (E-2-problem-modal.png)
- [x] PASS "Problem melden" on ORDER-2 (throwaway) → POST /brand/orders/30/problem 200 (reqid 573) → status SHIPPING_PROBLEM, shipment PROBLEM
- [x] FAIL after the problem submit: no toast/confirmation and the list is not refetched — row still "BEZAHLT" with "Versenden" until "Aktualisieren" (then "VERSANDPROBLEM") (LOW; E-2-problem-submitted.png)
- [x] PASS "Versenden" ORDER-1 modal: 3 Brand A lines only; carriers DHL/DPD/FedEx/Other/UPS each toggle; submit disabled until carrier+tracking; tracking 1Z999AA10123456784, UPS, date 03.10.2026 → POST /brand/orders/27/ship 200 (reqid 578) body {carrier:UPS, trackingNumber, note:"Voraussichtliche Lieferung: 2026-10-03"} → shipment SHIPPED; row "VERSANDT", Tracking link https://www.ups.com/track?loc=de_DE&tracknum=1Z999AA10123456784; KPI Versandbereit 4, Versandt 3
- [x] NOTE brand-scoped order response shows order status SHIPPED although Brand B has not shipped yet (check in admin)

### Task 10 Step 3 — Brand B Bestellungen (brandB pageId 5)
- [x] PASS ORDER-1 row in Brand B: only "E2E-0930 Brand B Trouser", € 64,95 (59,95 + 5,00 Brand B shipping), thumb BEIGE-1 (f990c623); expand → "Brand B Trouser — L / BEIGE × 1 € 59,95", no P1/P2 and no Brand A amounts
- [x] PASS "Versenden" → UPS, tracking 1Z999AA10123456785 → POST /brand/orders/27/ship 200 (reqid 207) → Brand B shipment SHIPPED; response scoped to Brand B (items: only P3, subtotal 59,95) (E-3-brandB-ship-modal.png)

### Task 10 Step 4 — Admin (pageId 2, isolatedContext admin)
- [x] PASS admin "Bestellungen" list: ORDER-1 € 319,75, 4 items, "VERSANDT", tracking "UPS 1Z999AA10123456784 · UPS 1Z999AA10123456785"; detail SENDUNGEN lists both brands with their tracking
- [x] PASS admin ORDER-1 "Status ändern…" = DELIVERED → "Speichern" → PATCH /admin/orders/27/status?status=DELIVERED 200 (reqid 112) → "GELIEFERT" (E-4-admin-order1-delivered.png)
- [x] FAIL admin status change uses the deprecated `PATCH /admin/orders/{id}/status?status=` endpoint (CLAUDE.md: removed next release). Once removed, admins cannot mark SHIPPED→DELIVERED from the UI (MEDIUM/risk; `lib/api/modules/adminApi.ts:118`)
- [x] FAIL admin orders list "KUNDE" column is "—" for every order (27 rows), although buyerEmail is in the payload (LOW)
- [x] FAIL admin order detail LIEFERADRESSE also omits house number and Adresszusatz ("Marienplatz / 80331 München"; "Teststraße / 10115 Berlin") (same root as Step 2 MEDIUM)
- [x] FAIL admin ORDER-1 RED S line "× 2 · S · RED — € 69,95" shows the unit price without a line total (139,90) (LOW/INFO)
- [x] FAIL admin ORDER-2 after the brand problem report: order status "BEZAHLT" while the shipment shows "PROBLEM"; the brand view showed status VERSANDPROBLEM. The admin "Versandproblem" chip would not find it (LOW)
- [x] PASS admin ORDER-2 "Stornieren" → modal "BESTELLUNG STORNIEREN" with paid-refund warning; reason combobox options Verdacht auf Betrug / Ausverkauft / Kundenwunsch / Technischer Fehler / Sonstiges each selected, ended Sonstiges; note typed → POST /admin/orders/30/cancel 200 (reqid 114) body {reason:"OTHER", note} → status CANCELLED, cancellationReason OTHER, refundTransactionId re_2FiFUFBc3Lp5rszvz2XXJ; row "STORNIERT" (E-4-admin-cancel-order2-modal.png, E-4-admin-order2-cancelled.png)
- [x] PASS (record) ORDER-FAIL ENS-2026-FPRD0G and ORDER-CANCELED ENS-2026-TK3E1I still "AUSSTEHEND" at 20:29 (created 20:08/20:10; 30-min auto-cancel not due yet) — re-check later

### Task 10 Step 5 — Customer return (customer pageId 4)
- [x] PASS /account "BESTELLUNGEN": ORDER-1 "ZUGESTELLT" 319,75 €; ORDER-2 "STORNIERT" with "Diese Bestellung wurde storniert. Die Erstattung ist unterwegs … 5–10 Werktagen", shipment "Versandproblem" (E-5-customer-order2-cancelled.png)
- [x] PASS ORDER-1 detail: 4 lines with colour thumbs, 2 per-brand shipping lines, SENDUNGEN per brand "Versandt — UPS" + "SENDUNG VERFOLGEN →" (/sendungsverfolgung?tracking=…84 / …85)
- [x] FAIL ORDER-1 SENDUNGEN still say "Versandt" after admin set DELIVERED (order ZUGESTELLT) — shipment status not advanced (LOW/INFO)
- [x] PASS "RETOURE EINLEITEN" → form "RETOURE BEANTRAGEN": 4 item checkboxes (incl. P3 of Brand B), reason combobox, description, submit, ABBRECHEN
- [x] FAIL no quantity selector: the RED S line (×2) can only be returned as a whole; "1 of 2" is impossible from the UI and the API body has no quantity (`{"orderItemId":49,…}`) (MEDIUM; E-5-return-form.png). Also the form accepts only ONE item per request (orderItemId singular) although it renders checkboxes
- [x] PASS reason options clicked: Falsche Farbe, Beschädigt angekommen, Defekt / nicht funktionsfähig, Nicht wie beschrieben, Nicht mehr benötigt, Sonstiges, then "Falsche Größe" (no literal "Größe passt nicht" option; closest = WRONG_SIZE)
- [x] PASS submit → POST /orders/27/return 200 (reqid 6242) body {orderItemId:49, reason:"WRONG_SIZE", description} → order RETURN_REQUESTED, return **RET-2026-1FVC6C** (id 12), brandId 5 Claude Testmarke 0109 only, orderItemIds [49], shipTo "Enunas Retouren – Claude Testmarke 0109, Rücksendeweg 7, 10117 Berlin" (E-5-return-requested.png)
- [x] PASS customer sees "RETOURE BEANTRAGT", instructions, Rücksendeadresse and "Retourennummer: RET-2026-1FVC6C"
- [x] FAIL customer return block doesn't say which item(s)/brand the return covers (LOW)

### Task 10 Step 6 — Admin returns, reconciliation, payouts (admin pageId 2)
- [x] PASS admin "Rückgaben": RET-2026-1FVC6C listed first, brand "Claude Testmarke 0109", ENS-2026-1TWSCJ, "2× E2E-0930 Colour Hoodie — S · RED" with RED-1 thumb, reason "Falsche Größe", Zieladresse snapshot; KPIs Beantragt 1
- [x] PASS "Retoure genehmigen" → POST /admin/returns/RET-2026-1FVC6C/approve 200 (reqid 120) → GENEHMIGT (button shows "Wird ausgeführt…" while pending)
- [x] PASS "Wareneingang buchen" → POST /admin/returns/RET-2026-1FVC6C/receive 200 (reqid 122) → EINGEGANGEN; the correct /admin/returns/* routes are used, not the deprecated order-scoped shim (E-6-admin-return-received.png)
- [x] PASS "BETRAG (OPTIONAL)" = 69.95 (to emulate "1 of 2", see Step 5 FAIL) → "Erstattung auslösen" → POST /admin/returns/RET-2026-1FVC6C/refund?refundAmount=69.95 200 (reqid 124) → return REFUNDED 69,95 (refundedAt 20:31:46); card "Erstattet: € 69,95 · Abgeschlossen"; KPI Erstattet 11 · 1.219,35 → 12 · 1.289,30 (+69,95 ✓)
- [x] NOTE order ENS-2026-1TWSCJ stays RETURN_RECEIVED after the partial refund (return itself REFUNDED); order-level refundTransactionId null
- [x] FAIL refund amount spinbutton exposes `valuemax="0"` in the a11y tree (DOM max="" — harmless for input, but screen readers announce max 0) (INFO)
- [x] FAIL no reconciliation UI in the admin dashboard — nothing under Abrechnung/Marken calls /admin/reconciliation (grep: no "reconciliation" in app/). /admin/reconciliation/5 could not be checked via UI (INFO/gap)
- [x] PASS "Abrechnung" › Offen, period 2026-09 (typed into the month spinbutton; defaults to 2026-08): brand #5 Claude Testmarke 0109 — Provision netto 102,80 · USt 19,52 · brutto 122,32 · Versand 54,96 · Auszahlung 607,24 · 13 Best. · 7 Rückg. (GET /admin/settlements?period=2026-09); Brand B #6 payout 678,31 (E-6-admin-abrechnung-sep.png)
- [x] FAIL Abrechnung chart "PROVISION & SEPA-AUSGÄNGE — LETZTE 14 MONATE" runs Apr 25–Mai 26 and "YTD PROVISION €44K · Jan–Mai 2026" — placeholder/mock data in a finance view (LOW)
- [x] PASS "Auszahlungen" › "PAYOUTS GENERIEREN" → POST /admin/payouts/generate 200 (reqid 137) response `[]`; dashboard all 0 (no payouts created; negativeBrands [])
- [x] FAIL "PAYOUTS GENERIEREN" gives no feedback at all when 0 payouts are generated (no toast), while Offen shows 1.462,92 € SEPA due for 4 brands — admin can't tell why nothing was generated (LOW)
- [x] PASS admin tab still on https://www.enunas.com/dashboard/admin, logged in as enunas.munich@gmail.com

### Task 10 Step 7 — Brand A Produkte (brandA pageId 3)
- [x] PASS search "E2E" → Colour Hoodie + Fallback Tee · "Hoodie" → Enunas Signature Hoodie + Colour Hoodie · "zzz" → "KEINE PRODUKTE GEFUNDEN." · "Aktualisieren" (footer) refetches
- [x] PASS P1 "Bearbeiten" → Produktdetails: Material "100% Bio-Baumwolle E2E", Kollektion "E2E Herbst 2026 edit", Beschreibung "+ E2E-edit" → "Speichern" PUT /products/update/30 200 (reqid 641) → page reload → values persisted
- [x] FAIL Produktdetails has no "Herkunft/Herkunftsland" field (wizard has it; value Portugal) — origin cannot be edited after creation (LOW). Used Kollektion as third field
- [x] PASS second edit (Material "SHOULD NOT SAVE") → "Abbrechen" closes the panel, no PUT; reopened → still persisted value. Then reverted to originals (100% Baumwolle / E2E Herbst 2026 / original Beschreibung) → PUT reqid 744 200
- [x] PASS "Varianten": 7 variants, stock −/+; "VARIANTEN HINZUFÜGEN" Rot + L + Bestand 3 → "1 Variante hinzufügen (Rot)" → POST /products/30/variants 201 (reqid 761) → variant 75 RED L colorId 40 (same RED colour), SKU 6TAITLRJ; stock + + − → 4 (PUT /variants/75 200); total 37→38 Stk
- [x] PASS customer PDP after add: RED offers S/M/**L**; L selectable but CTA "Derzeit nicht verfügbar" (no listing yet) (E-7-pdp-red-L-unavailable.png)
- [x] FAIL adding a variant creates no listing and the Varianten view gives no hint that RED L needs a price/listing to be buyable (LOW/UX)
- [x] PASS variant trash → DELETE /products/30/variants/75 204 (reqid 766); PDP reload → RED "L" disabled + line-through
- [x] FAIL variant delete has no confirmation at all (single click deletes; handle_dialog found no dialog) (LOW)
- [x] PASS listing RED/S "Bearbeiten" → 84,95 (live Netto 71,39 + MwSt 13,56) → "Aktualisieren" PUT /products/30/listings/63 {price:84.95, discountPrice:69.95} 200 (reqid 772) → PDP RED S: 69,95 / ~~84,95~~ "REDUZIERT −18 %", RED M still 89,95 (−22 %) → reverted to 89,95 (PUT reqid 773 {price:89.95, discountPrice:69.95})
- [x] FAIL listing edit: toggling "Netto (exkl. MwSt.)" and back to "Brutto" silently clears BOTH price fields incl. the sale price; saving then would drop the 69,95 sale price (MEDIUM — silent price loss). Re-entered 69,95 before saving
- [x] PASS throwaway listing RED M · Europa 99,95 → "Listing hinzufügen" POST /products/30/listings 201 (reqid 774, listing 75) → shown (Netto 83,99 + 15,96)
- [x] FAIL listing "Löschen" deletes immediately with no confirm dialog (DELETE /products/30/listings/75 204, reqid 776) — the plan's dismiss-then-accept could not be exercised (LOW)
- [x] FAIL "Vervollständige den Look": header says "2/4 GEWÄHLT" but none of the tiles shows the selected check (saved look = Aurora Parka 24 + Cargo Pant 8). Clicking Aurora (already saved) ADDS it again → 3/4 and "Look speichern" sends `completeTheLookProductIds:[24,8,24]` (PUT reqid 777; backend de-dupes). Clicking again → 2/4 → [24,8] (reqid 792). Saved selections are not recognised by the picker (id format mismatch between `selected` (String(p.id)) and the picker tiles) (MEDIUM; E-7-look-before.png, E-7-look-after-add.png; `app/(dashboard)/dashboard/vendor/_components/products/CompleteTheLookSection.tsx` + its picker)
- [x] PASS Produktbilder re-verify: groups "Alle Farben (geteilt)" 1 image, Rot 2, Weiß 2, Schwarz 2, each with colour combobox, "Als Titelbild setzen"/"Bild löschen", "Weiteres Bild hinzufügen" per group (not changed)

### Task 10 Step 7 — Brand A Retouren / Auszahlungen / Rabattcodes
- [x] PASS Retouren: RET-2026-1FVC6C listed (Bestellung ENS-2026-1TWSCJ · 30.09.26), status ERSTATTET with progression BEANTRAGT→GENEHMIGT→EINGEGANGEN→ERSTATTET, RED-1 thumb (2aba25c8) "2× E2E-0930 Colour Hoodie — S · RED", reason label "Falsche Größe" + description, frozen Lieferadresse snapshot; only Brand A returns (5) shown (E-7-brandA-retouren.png)
- [x] PASS Retouren KPI cards: Retouren 5 · Offen 0 · Rückerstattungen € 490 (= 119,95+99,95+99,95+99,95+69,95 = 489,75, rounded) · Retourenquote "— BALD VERFÜGBAR"
- [x] FAIL Retouren has NO status filter controls at all (plan expects one per status) and the card doesn't show the refunded amount (69,95) while it says "2×" — brand can't see it was a partial refund (LOW)
- [x] FAIL console on Retouren: one "Failed to load resource: 404" (source not identified among fetch/xhr; likely an asset) (INFO)
- [x] PASS Auszahlungen "Neu laden" → GET /brand/payouts 200 (reqid 809); cards Offen/Unterwegs 0,00 €, Erhalten 0,00 €, Letzte Zahlung —, 0 Auszahlungen; empty state text
- [x] FAIL Auszahlungen: no payout row for ORDER-1 (admin "PAYOUTS GENERIEREN" returned []), so the "net of refund" hand-check is impossible; also no status filters exist in this view. Admin Abrechnung shows 607,24 € due to brand 5 for 2026-09, the brand sees 0,00 € / "OFFENE AUSZAHLUNG —" (MEDIUM: brand & admin disagree on the open balance)
- [x] PASS Rabattcodes view: KPI cards, status combobox (Alle/Aktiv/Inaktiv each selected), "Code suchen…" (E2E), empty state
- [x] PASS create form validation: PROZENT 0.2 → browser blocks "Wert muss kleiner als oder gleich 0,15 sein."
- [x] FAIL **HIGH** "ERSTELLEN" E2E0930, 0.1, max 5 → POST /brand/discounts **400** `{"message":"Unknown field: active"}` (reqid 814; again with "Aktiv" unchecked reqid 816 → same 400). The UI shows the raw English "Unknown field: active". Brands cannot create any discount code. Frontend sends `active` which the backend DTO rejects (`lib/api/modules/discountsApi.ts:39` / vendor Rabattcodes form) (E-7-discount-create-400.png)
- [x] BLOCKED Rabattcodes search/edit of E2E0930, customer checkout with E2E0930 (Brand-A-only discount check vs P3), and delete — no code could be created
- [x] FAIL "PROZENT" field expects a fraction (0.1 = 10 %) although labelled Prozent (LOW/UX)

### Task 10 Step 7 — Brand A Einstellungen
- [x] PASS Markenprofil read-only: Markenname "Claude Testmarke 0109" (nicht änderbar), Status AKTIV, Mitglied seit 1.9.2026
- [x] FAIL Markenprofil "E-MAIL (NICHT ÄNDERBAR)" shows "—" although the account e-mail is known (sidebar shows it) (LOW)
- [x] PASS Website "kein-link ohne schema" → PATCH /brandpartner/me 400 → inline "Speichern fehlgeschlagen: websiteUrl: muss eine gültige URL sein (400)"
- [x] PASS Kontakt-E-Mail "keine-email" → 400 "contactEmail: muss eine korrekt formatierte E-Mail-Adresse sein (400)" (browser validity also false, but the form still submits)
- [x] FAIL error copy leaks raw field names and status codes ("websiteUrl: … (400)", "instagramHandle: must contain only letters, digits, . and _ (400)" in English) (LOW)
- [x] FAIL Instagram/TikTok placeholders say "@marke", but "@e2e0930" → 400 "instagramHandle: must contain only letters, digits, . and _" — the UI suggests a format the backend rejects and doesn't strip "@" (LOW/MEDIUM)
- [x] PASS bio "E2E-0930 bio" + website https://example.com/e2e0930 + IG/TikTok "e2e0930" → PATCH 200 (reqid 821) "Gespeichert"
- [x] FAIL **bio not shown on /marken/claude-testmarke-0109** (customer tab): page shows generic "Kuratierte Pieces von claude-testmarke-0109 …", no bio/website/socials; `app/(root)/marken/components/HeroBrand.tsx` only takes brandName/count — the "Öffentliches Profil" (description, website, socials, logo, hero) is never rendered although the field says "erscheint auf deiner öffentlichen Markenseite" (MEDIUM; E-7-marken-bio-missing.png). Also the hero now shows the slug "claude-testmarke-0109" instead of the brand name (LOW)
- [x] PASS reverted Öffentliches Profil to previous empty values (description/website/IG/TikTok "") → PATCH 200 (reqid 826)
- [x] FAIL **UST-IDNR. "DE12" accepted** → PATCH 200 (reqid 822), no client or server validation; VAT id drives commission invoicing/compliance (MEDIUM; E-7-settings-vat-DE12-accepted.png). Reverted to DE123456789 (reqid 823)
- [x] PASS LAND combobox: Österreich / Vereinigte Staaten → "Ausland · Reverse Charge (§ 3a Abs. 2 UStG)", Deutschland → "Inland · 19 % USt"; Speichern buttons disabled when unchanged (not saved)
- [x] FAIL Retouren PLZ "ABC" accepted → PATCH 200 (reqid 824), no postcode validation (LOW). Reverted to 10117 (reqid 825)
- [x] SKIP "Logo hochladen" / "Hero-Bild ersetzen" — not exercised to avoid changing production brand imagery that cannot be restored to the originals
- [x] PASS Konto-Informationen is static read-only text (Retourenadresse, Produkt-Genehmigungen, Versandverantwortung)
- [x] FAIL Konto-Informationen says "Neue Produkte müssen vom Enunas-Team genehmigt werden" — contradicts products going ACTIVE immediately (same as Phase A MEDIUM, not re-counted)

### Task 10 Step 7 — Analytics / Marketing ("BALD")
- [x] PASS Analytics: "BRAND PORTAL · PHASE 2" placeholder, 8 metric tiles (Sessions, Add-to-Cart-Rate, Conversion, Ø Bestellwert, Funnel, Umsatz nach Produkt, Traffic-Kanäle, Märkte) all "— BALD VERFÜGBAR"; no interactive controls; no new console errors
- [x] PASS Marketing: same pattern, 8 tiles (Kampagnen-Umsatz, Werbeausgaben, ROAS, Promo-Anteil, Kampagnen-Performance, Hero-Slot-Impressionen, CTR, Rabattcode-Umsatz) "— BALD VERFÜGBAR"; no controls; no console errors. NOTE: placeholders only, no mock numbers
- [x] FAIL Brand A Bestellungen after admin DELIVERED + refunded return: ORDER-1 still "VERSANDT", KPI GELIEFERT 0 / RÜCKGABEN 0 (brand-scoped status follows the shipment, never advances) (LOW; same root as the Rückgabe-chip FAIL)

### Task 10 Step 8 — Brand B quick pass (brandB pageId 5)
- [x] PASS Übersicht: Warenumsatz MTD 784,55 € (abzgl. 499,75 € Erstattungen) — equals admin settlement Warenumsatz for brand 6; Offen 3; Offene Punkte 4L7JX2/KPOV6I/6WRVFC + low-stock P3 BEIGE M 5 / BEIGE L 4; nothing of Brand A
- [x] FAIL Brand B "Umsatzverlauf" y-axis runs to "€ -75" (negative day from refunds plotted below zero) (INFO/LOW)
- [x] PASS Bestellungen: 7 rows, ORDER-1 only "E2E-0930 Brand B Trouser € 64,95 VERSANDT"; no ORDER-2/FAIL/CANCELED, no P1/P2 (E-8-brandB-bestellungen.png)
- [x] PASS Retouren: 3 Brand B returns (NMSY0W, AOBV1D, RQPZBK); RET-2026-1FVC6C / Rücksendeweg 7 absent
- [x] PASS Auszahlungen: 0 payouts, nothing of Brand A

### Task 10 Step 7 — Abmelden (brandA pageId 3, LAST)
- [x] PASS "Abmelden" → https://www.enunas.com/dashboard/login, localStorage cleared; direct /dashboard/vendor → redirected to /dashboard/login
- [x] PASS admin tab (pageId 2) still on https://www.enunas.com/dashboard/admin, logged in as enunas.munich@gmail.com (never logged out)

### Phase E summary
- PASS 61 · FAIL 37 ledger lines (incl. 1 tooling-only INFO) (1 HIGH: brand discount create 400 "Unknown field: active"; MEDIUM: incomplete shipping address to brands/admin, no return-quantity selector, Netto/Brutto toggle wipes sale price, Complete-the-Look picker ignores saved picks, VAT "DE12" accepted, public brand profile never rendered, brand vs admin open-balance mismatch, deprecated admin status endpoint) · 1 BLOCKED line covering 3 sub-steps (discount search/edit, checkout discount scoping, delete) · 1 SKIP (logo/hero upload)
- Return number: RET-2026-1FVC6C (Brand A only; refunded 69,95)

## Phase F — Task 11 negative & boundary sweep (2026-09-30 ~20:45–20:55 UTC)

### Step 1 — Customer on dashboards (customer pageId 4)
- [x] PASS /dashboard/vendor → redirected to /dashboard/login, no vendor data rendered (F-1-vendor.png)
- [x] FAIL vendor dashboard fires GET /products/my, /brand/orders, /brandpartner/me, /brand/payouts with the CUSTOMER token before redirecting (all 403, reqid 6681–6684; nothing shown) — role guard runs after data fetch (LOW)
- [x] PASS /dashboard/admin → redirected to /dashboard/login, no admin API calls made
- [x] PASS customer stays logged in after both visits (enunas_token kept; /account "Guten Tag, David.")

### Step 2 — Cross-brand authorization (Brand B token, brandB pageId 5, raw fetch)
- [x] PASS PUT https://api.enunas.com/products/update/30 {"name":"HACKED"} → **403** "You do not own this product"
- [x] PASS DELETE https://api.enunas.com/products/delete/30 → **403** "You do not own this product"
- [x] PASS P1 afterwards: GET /products/30 → name "E2E-0930 Colour Hoodie", ACTIVE (unchanged)

### Step 3 — Invalid colour param
- [x] PASS /bekleidung/claude-testmarke-0109/e2e-0930-colour-hoodie?color=Doesnotexist → RED selected (first colour), RED gallery (RED-1, SHARED, RED-2), sizes S/M enabled, L disabled; no console errors besides pre-existing PostHog-token/preload warnings (F-3-bad-colour.png)

### Step 4 — WHITE sold out (Brand A Varianten UI → customer PDP)
- Before: WHITE M (65) 5, WHITE L (66) 5. Brand A re-logged in via /dashboard/login UI.
- [x] PASS Brand A "Ausverkauft" on WHITE M and WHITE L → PUT /products/30/variants/65 and /66 200; total 34 → 24 Stk.
- [x] PASS customer PDP reload → WHITE: S/M/L all disabled (struck through), CTA "Ausverkauft" disabled — add-to-cart blocked (F-4-white-soldout.png)
- [x] PASS restored via "Wieder verfügbar" → WHITE M 5, WHITE L 5 (verified GET /products/30/variants). After: identical to before
- INFO: with WHITE sold out the swatch order became RED, BLACK, WHITE and the WHITE gallery opened on P1-SHARED (then WHITE-1, WHITE-2)

### Step 5 — Keyboard-only pass
PDP (customer, 31 Tabs; F-5-pdp-tab03/11/23/31.png):
- [x] PASS reachable in order: Menü, Logo, Suche, Konto, Wunschliste, Warenkorb, Favorit, 3 Bild-Dots, Bild vergrößern, breadcrumb ×3, brand link, SKU copy, 3 colour swatches, sizes S/M, Streetwear, "Größe wählen" CTA, 3 accordions; all `:focus-visible`
- [x] FAIL **closed off-canvas panels stay in the tab order**: after the main swatches focus moves into the hidden "Farbe wählen" dialog (translateX(340px), off-screen, not inert/aria-hidden) — Schließen + 3 swatches; same for closed Warenkorb (4), Hauptnavigation (20) and Suche (7) panels = ~34 invisible tab stops, focus vanishes off-screen (MEDIUM, a11y; F-5-pdp-tab23.png shows no visible focus)
- [x] FAIL **no visible focus indicator** on the colour swatches, the brand link "CLAUDE TESTMARKE 0109" and the SKU copy button (computed outline-style none, no box-shadow while :focus-visible) (MEDIUM, a11y)
- [x] FAIL default focus ring on header icons/breadcrumbs/CTA is the browser's 1px auto grey at 50 % alpha — barely visible on white, not the brand purple (LOW; F-5-pdp-tab03.png)
- [x] FAIL unnamed focusable DIV in the gallery (scroll container, tab stop with no accessible name) (LOW)
Vendor sidebar (Brand A, 11 Tabs; F-5-vendor-tab03/10.png):
- [x] PASS Übersicht → Bestellungen → Produkte → Analytics → Retouren → Auszahlungen → Marketing → Rabattcodes → Einstellungen → Abmelden → "VOLLSTÄNDIGE ANALYSE"; visible white ring on purple sidebar
- [x] FAIL Varianten rows: icon-only delete buttons (and product-row icon buttons) have no accessible name (focus log label "") (LOW)

### Step 6 — prefers-reduced-motion
- [x] BLOCKED live emulation: the chrome-devtools `emulate` tool in this session exposes no reduced-motion option (only colorScheme/viewport/network/CPU/UA/geo), so no before/after screenshots
- [x] PASS (static) production CSS contains a global `@media (prefers-reduced-motion: reduce){*,::before,::after{transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}` plus nav/footer/menu-tile overrides → CSS transitions/animations would be suppressed
- [x] FAIL (static, unverified live) homepage has 3 autoplaying videos (all playing); Hero.tsx and Subscribe.tsx don't check reduced motion (FounderQuote.tsx does) — looping video keeps playing for reduced-motion users (LOW)

### Step 7 — Pending orders auto-cancel (customer /account → Bestellungen, 20:53 UTC)
- [x] PASS ENS-2026-FPRD0G → STORNIERT (44,95 €)
- [x] PASS ENS-2026-TK3E1I → STORNIERT (44,95 €) (F-7-orders.png)
- [x] PASS P2 BLUE M stock released: variant 70 BLUE M = 5 (BLUE L 71 = 5, GREEN M 72 = 4); PDP ?color=BLUE sizes M and L enabled (F-7-p2-blue.png)

### Phase F summary
- PASS 21 · FAIL 8 (0 CRITICAL/HIGH; MEDIUM: off-canvas panels in tab order, swatches/brand link/SKU copy without focus indicator; LOW: customer-token brand API calls before redirect, faint default focus ring, unnamed gallery DIV, unnamed icon buttons in vendor, autoplay videos ignore reduced motion) · 1 BLOCKED (live reduced-motion emulation)
- Authorization: PUT /products/update/30 → 403, DELETE /products/delete/30 → 403 (Brand B token)

## Localhost verification (2026-10-04, http://localhost:3000 → api.enunas.com)
- STEP 0: page 6 (localCustomer) was NOT logged in; localhost localStorage enunas_wishlist [] (no WHITE leftover from the aborted V6), cart []. Wishlist is per-origin localStorage, so the production wishlist (P1 RED + P3) is unaffected. Old V-*.png from the aborted run are overwritten.
- V1 PASS homepage: "Unsere Favoriten" 4 cards (Cargo Pant, Terra Tee, Drift Trousers, Nomad Jacket); "Neue Arrivals" 4 cards, newest first: P3 Brand B Trouser, P2 Fallback Tee, P1 Colour Hoodie, Drift Trousers (V-1.png)
- V2 PASS homepage P1 card: image P1-BLACK-2 (6badffdc), first swatch BLACK (rgb 10,10,10), link ?color=BLACK, 69,95€ + struck-through 89,95€ (line-through) (V-2.png)
- V3 PASS /neu default sort (NEUHEITEN): order P3 BEIGE, P2 BLUE, P2 GREEN (P2-SHARED image), P1 RED, P1 BLACK, P1 WHITE, then Drift Trousers… (V-3.png)
- V4 PASS /marken/claude-testmarke-0109: P2 GREEN card (?color=GREEN) shows P2-SHARED (880fbff9), BLUE card shows P2-BLUE-1 (V-4.png)
- V5 PASS /bekleidung/streetwear lists P3 Brand B Trouser + P1 Colour Hoodie; /bekleidung/athleisure lists P2 Fallback Tee (V-5.png = streetwear)
- V6 PASS (logged in via /account UI) P1 PDP → WHITE → heart: localStorage item href ".../e2e-0930-colour-hoodie?color=WHITE", image WHITE-1 (0b6d86f0); /saved-lists card links to ?color=WHITE and shows P1-WHITE-1; clicking it opens the PDP with WHITE pressed (SKU KKURR8V2) (V-6.png). Minor (LOW, new): the saved-lists card's swatch row still shows "RED" first (not the saved WHITE). Restored: WHITE removed, RED favourited, P3 favourited → localhost wishlist = P1 (RED) + P3
- V7 PASS cart sidebar tab "Wunschliste 2" (matches 2 saved items), panel "2 Lieblingsstücke gemerkt" + link "WUNSCHLISTE ANSEHEN" → /saved-lists (V-7.png)
- V8 PASS checkout (cart P3 BEIGE M + P1 BLACK M, saved address): E2EINVALID + ANWENDEN → POST /orders/preview 400 → "Dieser Gutscheincode ist ungültig oder abgelaufen." (V-8a.png); clearing the field by keyboard → message gone, next POST /orders/preview body {"items":[{listingId 73},{listingId 68}],"savedAddressId":6} — no discountCode (V-8b.png). Amounts German: 59,95 € / 69,95 € / Zwischensumme 129,90 € / Versand 10,00 € / Gesamt 139,90 €. NOTE: a programmatic fill("") (CDP) did not clear the message or re-preview; real typing+Backspace did. Not paid; cart kept
- V9 PASS /orders/ENS-2026-1TWSCJ/confirmation: Lieferadresse "Erika Mustermann / Marienplatz 1 / E2E Phase D / 80331 München"; P1 RED S line ×2 = €139,90; lines 69,95 + 139,90 + 39,95 + 59,95 = Zwischensumme €309,75, + 2×5,00 = Gesamt €319,75 (V-9.png). LOW (cosmetic): this page formats amounts as "€69,95" (prefix) while checkout/cart use "69,95 €"
- V10 PARTIAL → FAIL. (a) PASS 27 Tabs from top on P1 PDP: Menü, Logo, Suche, Konto, Wunschliste, Warenkorb, Favorit, 3 dots, gallery DIV, Bild vergrößern, 3 breadcrumbs, brand link, SKU copy, 3 swatches, S, M, Streetwear, CTA, 3 accordions — every focused element inside the viewport, none with an inert/aria-hidden ancestor; focus never entered the closed cart/menu/search/colour panels. (b) FAIL no visible focus ring on brand link, SKU copy button and colour swatches: :focus-visible matches, but computed outline-style "none" (width 2px, colour rgb(55,14,77)) because `focus:outline-none` sets `--tw-outline-style:none` and Tailwind v4 `focus-visible:outline` resolves to `outline-style: var(--tw-outline-style)` → none (BrandLink.tsx:20, ColorSelector.tsx:87, :115). Fix: drop `focus:outline-none` or use `focus:outline-hidden` / `focus-visible:outline-solid` (V-10a-brand.png, V-10b-sku.png, V-10c-swatch.png = V-10.png). The unnamed gallery DIV tab stop is still there (LOW, unchanged)
- V15 PASS (localBrandA, page 7, logged in via /dashboard/login UI) Bestellungen: "Rückgabe" chip lists ENS-2026-1TWSCJ (+ TFZNYE, O24AUN); ORDER-1 status label "RÜCKGABE ERH." (not "Versandt"); expanded row shows Lieferadresse Erika Mustermann / Marienplatz 1 / E2E Phase D / 80331 München / DE, items BLACK M ×1 € 69,95, RED S ×2 € 139,90, GREEN M ×1 € 39,95, tracking 1Z999AA10123456784 (V-15a.png list, V-15.png detail). Note: KPI tile "RÜCKGABEN 3" consistent with the chip
- V13 PASS Einstellungen: VAT "DE12" + Speichern → "Deutsche USt-IdNr.: „DE“ gefolgt von 9 Ziffern.", no PATCH sent (V-13a-vat.png), Abbrechen → DE123456789; return PLZ "ABC" (Deutschland) + Speichern → "PLZ: 5 Ziffern.", no PATCH (V-13b-plz.png), Abbrechen → 10117; Instagram "@e2etest" → PATCH /brandpartner/me 200 body instagramHandle "e2etest" (@ stripped); restored with a second PATCH instagramHandle "" (response vatId DE123456789, returnPostalCode 10117, instagramHandle ""). LOW (new): after Abbrechen the VAT error text stays visible although the field is back to DE123456789. NOTE: CDP fill("") does not update React state (Speichern stays disabled) — real keyboard needed
- V12 PASS P1 edit panel → "Vervollständige den Look": opens with "2/4 GEWÄHLT", Aurora Parka + Cargo Pant shown checked (V-12a.png); clicking Aurora Parka unselects it → "1/4 gewählt", only Cargo Pant checked, no duplicate (V-12b.png); re-clicked Aurora Parka (2/4 again), closed with Abbrechen — no "Look speichern", no write requests; saved look unchanged (Aurora Parka 24 + Cargo Pant 8)
- V14 step 1 PASS Rabattcodes: created E2E0930, 0.1 (10 %), aktiv → listed "E2E0930 10% — → — 0 / ∞ AKTIV" (no 400 "Unknown field: active") (V-14a.png)
- V14 step 2 PASS customer checkout (P3 BEIGE M 59,95 + P1 BLACK M 69,95) apply E2E0930 → POST /orders/preview discountCode "E2E0930" → discountAmount 6.99 = 10 % of P1 69,95 only (P3 not discounted; 10 % of 129,90 would be 12,99); UI "Rabatt (E2E0930) −6,99 €", "✓ Rabatt angewendet (−6,99 €)", Gesamt 132,91 € (V-14b.png). Not paid. Note: the line items in the summary don't show which line got the discount (only a total row) — INFO
- V14 cleanup: E2E0930 deactivated via "DEAKTIVIEREN" + confirm → status INAKTIV, "AKTIVE CODES 0" (code row remains, 1 gesamt — no delete action in UI); localhost customer cart emptied via /cart "ENTFERNEN" ×2 → cart []. Wishlist = P1 (?color=RED) + P3 (?color=BEIGE)
- V11 PASS create wizard: step 1 return period 31 → "Rückgabefrist muss zwischen 0 und 30 Tagen liegen.", stays on Grunddaten (V-11a-return31.png); step 2 two rows Schwarz/M → "Doppelte Variante: Schwarz / M. Bitte eine davon entfernen.", stays on Varianten (V-11b-duplicate.png); after fixing: Review shows GESCHLECHT "Herren" (V-11c-review.png) → POST /products/create **201** body gender "MEN", variants [BLACK M stock 1], releaseDate 2026-10-04, catalogue [STREETWEAR] → product id 33; POST /products/33/listings 201 (DE € 19,95). LOW (cosmetic): review shows PRODUKTTYP "T_SHIRT" (raw enum) while step 1 shows "T SHIRT"
- V11 cleanup PASS: Produkte trash icon → "Löschen bestätigen" → DELETE /products/delete/33 409 → UI offers "Listings löschen & erneut versuchen" / "Stattdessen archivieren" with German explanation (V-11d-delete409.png) → "Listings löschen & erneut versuchen" → DELETE /products/33/listings/76 204 → DELETE /products/delete/33 **204**; product gone from list (7 products again). Hard delete works once listings are removed
- Localhost summary: PASS 14 (V1–V9, V11–V15) · FAIL 1 (V10 focus ring: `focus:outline-none` + `focus-visible:outline` resolves to outline-style none in Tailwind v4). New LOW: saved-lists card swatch row starts with RED although the WHITE colourway was saved; VAT error stays visible after Abbrechen; confirmation page prices "€69,95" vs "69,95 €"; wizard review shows "T_SHIRT". End state: Brand A settings unchanged (VAT DE123456789, return PLZ 10117, IG empty), look Aurora Parka + Cargo Pant unchanged, E2E0930 INAKTIV, test product 33 deleted; localhost customer cart [] and wishlist P1 RED + P3; localhost pages 6/7 closed; production tabs 2–5 untouched
