# PDP Integration Guide (for Claude Code)

This package upgrades the Product Detail Page in
`app/(root)/bekleidung/[brand]/[slug]/`. Use the mockup
(`PDP - Color SKU v2.html` in the parent folder) as the visual source
of truth. All TSX in this `components/` folder is ready to drop in.

Tailwind tokens used (already in your project):
- `font-league-spartan`, `font-cormorant`, `font-mono` (add if missing — JetBrains Mono)
- `text-enunas-black`, `text-enunas-gray-medium`, `text-enunas-gray-light`, `bg-enunas-off-white`, `text-enunas-purple`, `bg-enunas-purple`, `text-enunas-purple-light`

If `font-mono` is not defined, add to `tailwind.config.ts`:
```ts
fontFamily: { mono: ['JetBrains Mono', 'ui-monospace', 'monospace'] }
```

---

## 1. Backend type (verify, don't replace if already correct)

The mockup is wired to your exact JSON shape:
```ts
type Product = {
  brandId: number;
  brandName: string;
  careInstructions: string | null;
  catalogueCategory: string[] | null;
  category: string;
  collectionName: string | null;
  description: string;
  gender: 'UNISEX' | 'MEN' | 'WOMEN' | null;
  id: number;
  images: string[];
  inspirationStory: string | null;
  material: string;
  name: string;
  originCountry: string;
  releaseDate: string | null;
  returnPeriodDays: number;
  status: 'ACTIVE' | 'INACTIVE';
  variants: Variant[];
  videos: string[];
};
type Variant = {
  color: string;
  id: number;
  size: string;
  sku: string;
  stockQuantity: number;
  weightGrams: number;
};
```
See `types/product.ts`.

**Key insight: SKU lives on the variant, not the product.** Every SKU
display in the UI looks up `variants.find(v => v.color === selectedColor && v.size === selectedSize).sku`.

---

## 2. File-by-file changes

### `components/ColorSelector.tsx` — REPLACE

Drop in the file from this folder. Adds `sku` prop, renders
`COLOR_NAME │ SKU` with click-to-copy + check-icon confirmation.

### `components/ProductDetails.tsx` — MODIFY

Wire the SKU through and restructure the column. Key edits:

```diff
- <ColorSelector colors={colorsForSelector} onColorSelect={...} />
+ <ColorSelector
+   colors={colorsForSelector}
+   selectedColor={selectedColor}
+   onColorSelect={setSelectedColor}
+   sku={selectedVariant?.sku ?? product.sku}
+ />
```

Order of elements in the right column (top → bottom):
1. `<BrandLink brand={product.brandName} />` + `<GenderBadge gender={product.gender} />` (in a flex row)
2. `<h1>` product name (Cormorant 38px)
3. Collection line italic (Cormorant)  — show only if `collectionName`
4. `<InspirationStory text={product.inspirationStory} />` — auto-hides on null
5. Price row
6. `<ColorSelector ... />`
7. `<SizeSelector variants={product.variants} selectedColor={...} ... />`
8. `<CatalogueTags categories={product.catalogueCategory} />`
9. `<SizeGuideRow />`
10. `<AddToCart />` (existing) — disable when no variant or `stockQuantity === 0`
11. `<StockIndicator stockQuantity={selectedVariant?.stockQuantity} />`
12. Accordion: Produktdetails / Versand & Rückgabe / Pflegehinweise

Remove from the Produktdetails accordion meta block:
`Größe`, `Release`, `Herkunftsland`, `Katalog`, `Pflege` (Pflege gets its own accordion).

### `components/SizeSelector.tsx` — REPLACE

Drop in the file. Disables sizes with no variant for the selected
color or `stockQuantity === 0` (strikethrough + non-clickable).

### `components/StyleCatalogue.tsx` — REPLACE with `CatalogueTags.tsx`

Drop in the file. Renders 3 fixed-width (150px) Cormorant tags with
a 1px black border. Falls back to `Streetwear / Culture / Star`
when `catalogueCategory` is null.

### `components/Accordions.tsx` (new helper) — see `components/PflegeAccordion.tsx`

Use this to replace the existing "Inspiration" accordion content with
care instructions — clear 17px body line + small monospace meta note.

### Below the PDP — ADD three sections in this order

In `app/(root)/bekleidung/[brand]/[slug]/page.tsx` (or wherever the
PDP wrapper is), add **before the footer**:

```tsx
<CompleteTheLook items={completeTheLookFor(product)} />
<MoreFromBrand brand={product.brandName} items={moreFromBrand(product.brandName)} />
<SimilarProducts items={similarFor(product)} />
```

Where `completeTheLookFor`, `moreFromBrand`, `similarFor` are your
recommendation engine calls (mock data shape in the mockup; replace
with real fetches). Each section accepts the same `ProductCard[]` shape:

```ts
type RecItem = {
  brand: string;
  name: string;
  price: string;     // pre-formatted e.g. "€ 1.120"
  colors: string[];  // hex values for the swatch dots
  href: string;
};
```

---

## 3. PDP layout

- Grid: `grid-cols-2` (was 1.4fr 1fr) — gallery ends exactly at the logo centerline
- Breadcrumb is **under** the product image, not above the gallery
- Stock indicator is **under** the CTA, not above

---

## 4. Brand link behaviour

The brand name above the product title is now a `<Link>` to
`/marken/${slugify(brandName)}` (or whatever your brand-page route is).
Styled purple at rest with a full purple underline so it reads as
clickable. See `components/BrandLink.tsx`.

---

## 5. Stock states

| `stockQuantity`  | UI                                                            |
|------------------|---------------------------------------------------------------|
| `> 5`            | green dot + "Auf Lager"                                       |
| `1 – 5`          | red dot + "Nur noch X verfügbar"                              |
| `0`              | size button strikethrough + disabled, CTA shows "Ausverkauft" |

---

## 6. Catalogue category fallback

`catalogueCategory: null` → show the design with `["Streetwear", "Culture", "Star"]`
so the layout doesn't collapse. In production these defaults can come from the
category service or be hardcoded per `product.category`. See `CatalogueTags.tsx`.

---

## 7. Visual reference

Open `../PDP - Color SKU v2 (standalone).html` in any browser. The mockup
includes a Tweaks panel and a "View JSON" peek that shows exactly which
JSON fields drive which UI elements.
