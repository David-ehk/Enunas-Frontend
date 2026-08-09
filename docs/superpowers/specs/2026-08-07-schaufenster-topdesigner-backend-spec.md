# Schaufenster & Top Designer — Backend Implementation Spec

**Date:** 2026-08-07
**Status:** Proposed — inferred from current frontend behavior and the documented API contract in `CLAUDE.md`. Not verified against backend Java source (unlike the checkout-address spec in this same folder) — the Spring Boot repo isn't part of this codebase, so treat table/column names here as a starting proposal, not a mandate.
**Scope:** Two admin curation features that currently work end-to-end in the UI but persist **only to the admin's own browser localStorage** — meaning a real site visitor on any other device never sees what the admin picked. This spec defines what each needs on the backend to actually reach visitors.

## 1. Problem

Both features today:
- Have a complete, working admin UI in `app/(dashboard)/dashboard/admin/_components/Storefront.tsx` (the "Schaufenster" tab).
- Persist via plain `localStorage.setItem(...)` (`lib/curation.ts`, `lib/topDesigners.ts`) — no network call at all.
- Are read back on the public site from that same localStorage key. An admin testing in their own browser sees their picks reflected correctly, which makes it *look* finished — but any other visitor always falls through to a fallback (newest products, or nothing).

Nothing below changes the frontend's visual design — only where the data lives.

## 2. Feature A — Schaufenster (Sortiment kuratieren)

### Current frontend contract (`lib/curation.ts`)
```ts
type Segment = 'streetwear' | 'cultural' | 'athleisure' | 'experimental' | 'star'

interface CurationData {
  trendy: string[]                              // ordered product IDs
  drops: string[]                                // ordered product IDs
  recommendations: Record<Segment, string[]>     // ordered product IDs, per segment
}
```
- **Order matters.** The first 4 IDs in any list are "above the fold" (shown immediately in the admin UI and, by the same convention, meant to be the ones shown without an expand click on the public site); the rest are reachable via "+N weitere".
- Admin UX: 3 tabs (Trendy / Drops / Empfehlungen), Empfehlungen has 5 further segment sub-tabs. A single "Änderungen speichern" button saves the **entire** `CurationData` blob at once — not per-item saves.

### Where it's read on the public site
| File | Uses |
|---|---|
| `app/(root)/trendy/components/CuratedSection.tsx` | `curation.trendy` |
| `app/(root)/drop/components/CuratedDropSection.tsx` | `curation.drops` |
| `components/CuratedRecommendations.tsx` | Walks `SEGMENT_PRIORITY = ['star','streetwear','cultural','athleisure','experimental']`, uses the first **non-empty** segment list. **Not personalized per logged-in customer today** — it's a fixed priority order, not "this customer's actual segment." Backend parity only needs to replicate that; true personalization is a separate, later decision (see §5). |

All three call `resolveCuratedOrNewest(ids, count)`, which resolves IDs → `productApi.getById()` each, **and falls back to the newest `count` live products whenever the curated list is empty.** This fallback must survive the migration (either kept client-side as-is, or reimplemented server-side) — without it, a freshly-launched storefront with no curation yet renders empty sections.

### Proposed backend design
One row per section is enough:
```sql
storefront_curation (
  section        VARCHAR PRIMARY KEY,   -- 'trendy' | 'drops' | 'recommendations:streetwear' | 'recommendations:cultural'
                                          -- | 'recommendations:athleisure' | 'recommendations:experimental' | 'recommendations:star'
                                          -- (6 rows total)
  product_ids    JSONB,                  -- ordered array of product IDs
  updated_at     TIMESTAMP,
  updated_by     BIGINT REFERENCES users(id)
)
```
(A normalized `storefront_curation_item(section, product_id, position)` table works equally well if JSONB isn't the team's preference — order must be preserved either way.)

**Endpoints**
| Method | Path | Auth | Body / Response |
|---|---|---|---|
| `GET`  | `/admin/storefront/curation` | ADMIN  | Full `CurationData` (all 6 lists) — loads into `Storefront.tsx` on mount |
| `PUT`  | `/admin/storefront/curation` | ADMIN  | Body: full `CurationData`, replaces all 6 lists in one call. Validate every ID resolves to an existing, live product. |
| `GET`  | `/storefront/curation`       | Public | Same shape, read-only, unauthenticated. Changes rarely — safe to cache aggressively. |

**Frontend changes once this exists:** `getCuration()`/`saveCuration()` in `lib/curation.ts` become real `fetcher()` calls to the two endpoints above; `resolveCuratedOrNewest()` stays exactly as-is.

## 3. Feature B — Top Designer

### Current frontend contract (`lib/topDesigners.ts`)
```ts
string[]   // up to 3 brand NAMES (not IDs), in display order
```
Admin picks up to 3 brands via chips in `Storefront.tsx`'s `TopDesignerPicker` (options sourced from `AdminApiProduct.brandName` — no brand ID is plumbed through on that screen today). Read on `app/(root)/marken/page.tsx` to populate the "Top Designer" row (`TopDesignerSection` → `FeaturedBrandCard`, 3 square cards, falls back to a letter-monogram when no `image`).

### Proposed backend design
Only ever 3 rows selected at once — a flag + rank on `BrandPartner` fits better than a join table:
```sql
ALTER TABLE brand_partners
  ADD COLUMN is_top_designer     BOOLEAN  DEFAULT FALSE,
  ADD COLUMN top_designer_rank   SMALLINT NULL;   -- 1..3, NULL when not selected; drives display order
```
Cap "how many brands have `is_top_designer = true`" at 3 — service-layer validation is simplest; a DB constraint works too if preferred.

**DTO addition** — `BrandPartnerResponseDto` gains `isTopDesigner: boolean` (+ optionally `topDesignerRank`). Mirror on the frontend: `ApiBrandPartner` in `types/api.ts` gets the same two optional fields once they exist.

**Endpoints**
| Method | Path | Auth | Body / Response |
|---|---|---|---|
| `PATCH` | `/admin/brands/{brandId}/top-designer` | ADMIN  | Body: `{ isTopDesigner: boolean, rank?: number }`. Reject a `true` that would push the total past 3. |
| `GET`   | `/brands/top-designers`                 | Public | Up to 3 brands (id, brandName, logoUrl are enough), ordered by `top_designer_rank`. **This is genuinely new** — there is no public brand-read endpoint at all today (`/admin/brands` is ADMIN-only). |

**Frontend changes once this exists:** `/marken/page.tsx` calls `GET /brands/top-designers` instead of `getTopDesigners()`; `lib/topDesigners.ts` and the admin `TopDesignerPicker`'s localStorage calls get replaced with the real `PATCH`; `FeaturedBrandCard` finally gets a real `logoUrl` instead of the letter-monogram fallback.

## 4. Worth deciding while in this area

`/marken/page.tsx`'s full A–Z brand list currently derives brand *names* from the public products endpoint (`GET /products`), because no public brand-listing endpoint exists at all. If `GET /brands/top-designers` gets built, it may be worth widening it slightly to a general `GET /brands?status=APPROVED` (or similar) — the A–Z list could then show real logos everywhere too, not just for the top 3.

## 5. Explicitly out of scope here
- Personalizing `recommendations` to the actual logged-in customer's spend segment (today's `SEGMENT_PRIORITY` fallback is not personalized — this spec only asks for parity with that behavior, not new logic).
- Click/impression analytics on curated placements — not part of either current implementation.
