# Enunas PDP — Full Handoff Bundle

Everything Claude Code needs to implement the new PDP on your codebase.

## What's in this folder

### 📐 Visual reference (open in browser)
- **`PDP - Color SKU v2 (standalone).html`** — Self-contained working mockup. Drop-in clipboard copy, swatch + size + stock interactions, all three recommendation rows.
- **`PDP - Color SKU v2.html`** — Same page, CDN-linked fonts.

### 🛠 Codebase patch (`codebase-patch/`)
- **`INTEGRATION.md`** — Step-by-step developer guide. **Start here.**
- **`types/product.ts`** — TypeScript types matching the exact backend JSON shape + helper functions (`uniqueColors`, `findVariant`, `sortedSizes`).
- **`components/`** — Drop-in TSX components, all using Tailwind tokens from your existing project (`enunas-purple`, `font-cormorant`, `font-league-spartan`, etc.).
  - `ColorSelector.tsx` — color name + click-to-copy variant SKU
  - `BrandLink.tsx` — purple underlined link with arrow gone
  - `GenderBadge.tsx` — small purple-outlined gender pill
  - `InspirationStory.tsx` — editorial pull-quote with purple left bar (hidden when null)
  - `SizeSelector.tsx` — disables sizes with no variant or 0 stock
  - `CatalogueTags.tsx` — 3 fixed-width Cormorant tags, fallback when null
  - `SizeGuideRow.tsx` — Größentabelle / Passform entdecken links above CTA
  - `StockIndicator.tsx` — dot + label UNDER the CTA, color-codes low stock
  - `PflegeAccordionContent.tsx` — replaces the Inspiration accordion content
  - `ProductCard.tsx` — shared card for the three rec rows (silhouette placeholders)
  - `CompleteTheLook.tsx` — Ami Paris-style hero + adaptive grid (1/2/4 items)
  - `RecRow.tsx` — generic 4-column rec section
  - `MoreFromBrand.tsx` / `SimilarProducts.tsx` — wrappers around RecRow
  - `ProductDetailsRecipe.tsx` — full annotated PDP wrapper showing element order

## Workflow for Claude Code

1. **Read `codebase-patch/INTEGRATION.md`** — it lists every file to change and every new component to create.
2. **Open the mockup** in a browser. Use the "View JSON" panel in the top-right to see how each backend field maps to the UI.
3. **Adapt each component** to your codebase's actual import paths and patterns (the TSX uses `@/` and `next/link` — adjust if different).
4. **Test the stock states**:
   - Out of stock → size strikethrough, CTA "Ausverkauft"
   - Low stock (1–5) → red dot + "Nur noch X verfügbar" under CTA
5. **Test null handling**:
   - `catalogueCategory: null` → fallback tags render
   - `inspirationStory: null` → pull-quote hides
   - `collectionName: null` → italic line hides
   - `gender: null` → badge hides

## Backend contract recap

```ts
{
  brandName: string,
  catalogueCategory: string[] | null,
  collectionName: string | null,
  description: string,
  gender: 'UNISEX' | 'MEN' | 'WOMEN' | null,
  inspirationStory: string | null,
  material: string,
  name: string,
  originCountry: string,
  releaseDate: string | null,  // not displayed anymore
  returnPeriodDays: number,
  variants: [{ color, size, sku, stockQuantity, weightGrams }, ...]
}
```

**The displayed SKU is per variant** (color × size). Never use a product-level SKU.

## Notes

- All margins/spacing have been tightened from the early iterations — recommendation rows sit close to the main PDP, grid gaps are 16px.
- The brand link routes to `/marken/${slugify(brandName)}` by default — change in `BrandLink.tsx` if your brand-page route differs.
- The Größentabelle and Passform entdecken links currently route to `/info/groessentabelle` and `/info/passform-finden` — change in `SizeGuideRow.tsx` if needed.
