# Coming Soon Preview Product State — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third product state, "Coming Soon" (preview), so a brand can publish a product before its drop date — visible everywhere the storefront shows products, not buyable, price hidden, with a purple countdown to the release.

**Architecture:** The backend already returns `preview: boolean` on every product response (`price: null`, `originalPrice: null`, future `releaseDate`) and 409s any order for one. The frontend threads `preview` through the existing adapters, stops filtering preview products out of feeds (`sellableOnly`), renders a "Coming Soon" state on the product card and PDP with a shared `<ComingSoonCountdown>` component targeting UTC midnight of `releaseDate`, and applies per-surface placement rules via one pure helper (`lib/preview.ts`).

**Tech Stack:** Next.js 16 (App Router, React 19), TypeScript, Tailwind v4, Vitest + React Testing Library (jsdom), pnpm.

**Spec:** `docs/superpowers/specs/2026-09-08-coming-soon-preview-state-design.md`

## Global Constraints

- Package manager is **pnpm**. Run `pnpm run build` after TypeScript changes — the task is not done until it passes (CLAUDE.md hard constraint).
- Test runner: `pnpm exec vitest run <path>` for one file; `pnpm test:run` for all. Config: jsdom, `globals: true`, `@/` → repo root.
- Colours only from the Enunas scheme: purple `#370E4D` (`--enunas-purple` / `bg-enunas-purple` / `text-enunas-purple`), off-white `#F5F5F0`, white `#FFFFFF`. Fonts: `var(--font-league-spartan)` and `var(--font-Cormorant-Garamond)` (note the capitalised token name used in existing components) / `font-cormorant`.
- Animations: only `transform` / `opacity`; easing `ease-out-expo` or `ease-out-quart`, never `linear`; respect `prefers-reduced-motion`.
- **Detection signal is `preview === true`** — never infer "coming soon" from `releaseDate` alone or from `price == null`.
- **Countdown target is `Date.UTC(year, month-1, day)`** parsed from `releaseDate` (`"YYYY-MM-DD"`) — UTC midnight, matching the backend flip. Never Berlin midnight.
- Copy is German. Card badge: `Kommt am 1. Oktober`. PDP: `Kommt am 1. Oktober 2026`. Buy button: `COMING SOON`. Admin badge: `Vorschau`.
- Only modify what this plan lists. No unsolicited refactoring of surrounding code.
- `/neu` preview window is **7 days**. `/trendy` and the entire homepage **exclude** preview products.

---

### Task 1: Thread `preview` through types and adapters

**Files:**
- Modify: `types/api.ts` (`RawProductResponse` is in `productResponseAdapter.ts`; `ApiProduct` ~line 156, `AdminApiProduct` ~line 459)
- Modify: `lib/api/productResponseAdapter.ts:26-71` (`RawProductResponse`), `lib/api/productResponseAdapter.ts:92-183` (`adaptProduct`)
- Modify: `lib/api/productAdapter.ts` (`ProductCardShape` interface, `apiProductToCardShape`)
- Test: `lib/api/productResponseAdapter.test.ts` (existing file — add cases)

**Interfaces:**
- Produces:
  - `ApiProduct.preview?: boolean`
  - `RawProductResponse.preview?: boolean`
  - `AdminApiProduct.preview?: boolean`
  - `adaptProduct(raw)` sets `preview: raw.preview ?? false` on its result
  - `ProductCardShape.preview: boolean` and `ProductCardShape.releaseDate: string | null`
  - `apiProductToCardShape(p)` sets `preview: p.preview ?? false`, `releaseDate: p.releaseDate ?? null`, and when `p.preview` is true forces `price: ''` and `originalPrice: null`

- [ ] **Step 1: Write the failing tests**

Add to `lib/api/productResponseAdapter.test.ts` inside `describe('adaptProduct', ...)`:

```ts
it('carries the preview flag through, defaulting to false', () => {
  expect(adaptProduct(raw({ preview: true })).preview).toBe(true)
  expect(adaptProduct(raw({ preview: false })).preview).toBe(false)
  expect(adaptProduct(raw()).preview).toBe(false)
})

it('a preview product is unavailable with a null price coalesced to 0', () => {
  const p = adaptProduct(raw({ preview: true, price: null, originalPrice: null }))
  expect(p.preview).toBe(true)
  expect(p.available).toBe(false)
  expect(p.price).toBe(0)
  expect(p.originalPrice).toBeNull()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run lib/api/productResponseAdapter.test.ts`
Expected: FAIL — `preview` is not a property of the adapter result / `RawProductResponse`.

- [ ] **Step 3: Add `preview` to `RawProductResponse`**

In `lib/api/productResponseAdapter.ts`, in the `RawProductResponse` interface, next to `releaseDate?: string | null;`:

```ts
  /** Backend "not yet released" flag. When true: price/originalPrice are null and releaseDate is
   *  a future date. See docs/superpowers/specs/2026-09-08-coming-soon-preview-state-design.md §2. */
  preview?: boolean;
```

- [ ] **Step 4: Carry `preview` in `adaptProduct`**

In the returned object of `adaptProduct`, next to `releaseDate: raw.releaseDate || null,`:

```ts
    preview: raw.preview ?? false,
```

- [ ] **Step 5: Add `preview` to `ApiProduct`**

In `types/api.ts`, in `interface ApiProduct`, next to `releaseDate?: string | null;`:

```ts
  /** True while the product is published but not yet released. `price`/`originalPrice` are null,
   *  `releaseDate` is in the future, and POST /orders for its listing returns 409. */
  preview?: boolean;
```

`AdminApiProduct extends Omit<ApiProduct, 'status' | 'variants'>` so it inherits `preview` — add a one-line comment there:

```ts
  // `preview` inherited from ApiProduct — the admin product list badges it.
```

- [ ] **Step 6: Add `preview` + `releaseDate` to `ProductCardShape` and `apiProductToCardShape`**

In `lib/api/productAdapter.ts`, in `interface ProductCardShape` after `originalPrice?: string | null;`:

```ts
  /** True when the product is a not-yet-released "Coming Soon" item. Authoritative — the card
   *  ignores price/originalPrice when this is set. */
  preview: boolean;
  /** ISO date "YYYY-MM-DD" the product releases; null when not a preview product. */
  releaseDate: string | null;
```

In `apiProductToCardShape`, change the return object:

```ts
export function apiProductToCardShape(p: ApiProduct): ProductCardShape {
  const brandSlug = generateSlug(p.brandName);
  const preview = p.preview ?? false;
  return {
    id: p.id,
    imgURL: p.images?.[0] ?? '',
    brandName: p.brandName,
    productName: p.name,
    // A preview product has no price to format — the card renders "Kommt am …" instead.
    price: preview ? '' : `${p.price.toFixed(2).replace('.', ',')}€`,
    originalPrice:
      preview || p.originalPrice == null
        ? null
        : `${p.originalPrice.toFixed(2).replace('.', ',')}€`,
    href: `/bekleidung/${brandSlug}/${p.slug}`,
    colours: p.colours.map(c => ({ hex: c.hex, name: c.name, colorFamily: c.colorFamily })),
    createdAt: p.createdAt,
    sizes: p.sizes?.map(s => s.trim().toUpperCase()),
    catalogue: p.catalogue,
    category: p.category,
    subcategory: p.subcategory,
    gender: p.gender,
    preview,
    releaseDate: p.releaseDate ?? null,
  };
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `pnpm exec vitest run lib/api/productResponseAdapter.test.ts`
Expected: PASS (all cases, old and new).

- [ ] **Step 8: Build**

Run: `pnpm run build`
Expected: PASS. (`ProductCardShape` gained two required fields — if the build flags a construction site that builds the shape by hand rather than via `apiProductToCardShape`, add `preview: false, releaseDate: null` there. The wishlist/saved-lists path is handled in Task 10; if the build points there first, add the two fields with those defaults and Task 10 will refine.)

- [ ] **Step 9: Commit**

```bash
git add types/api.ts lib/api/productResponseAdapter.ts lib/api/productResponseAdapter.test.ts lib/api/productAdapter.ts
git commit -m "feat(products): thread preview flag through product adapters"
```

---

### Task 2: Stop filtering preview products out of feeds (`sellableOnly`)

**Files:**
- Modify: `lib/api/modules/productApi.ts:59-67` (`sellableOnly`)
- Test: `lib/api/modules/productApi.test.ts` (existing — add cases)

**Interfaces:**
- Consumes: `ApiProduct.preview` (Task 1)
- Produces: `sellableOnly(raw, content)` keeps a product when `p.available || p.preview`; still drops non-preview unavailable products; `totalElements` still decremented by the count actually removed.

- [ ] **Step 1: Write the failing tests**

Add to `lib/api/modules/productApi.test.ts` inside `describe('sellableOnly', ...)`:

```ts
it('keeps a preview product even though it is unavailable', () => {
  const result = sellableOnly(paged(3), [
    product({ id: '1' }),
    product({ id: '2', price: 0, available: false, preview: true }),
    product({ id: '3', price: 0, available: false }),
  ])
  expect(result.content.map(p => p.id)).toEqual(['1', '2'])
  expect(result.totalElements).toBe(2)
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run lib/api/modules/productApi.test.ts`
Expected: FAIL — product `'2'` is dropped, result is `['1']`.

- [ ] **Step 3: Change the keep condition**

In `lib/api/modules/productApi.ts`, in `sellableOnly`:

```ts
export function sellableOnly(raw: RawPagedProducts, content: ApiProduct[]): PagedProducts {
  // Keep sellable products AND preview ("Coming Soon") products — the latter are deliberately
  // merchandised before release (no price, not buyable). Everything else with no active listing
  // is still dropped so it never renders as 0,00 € or reaches the basket.
  const sellable = content.filter(p => p.available || p.preview);
  const removed = content.length - sellable.length;
  return {
    ...raw,
    content: sellable,
    totalElements: Math.max(0, raw.totalElements - removed),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run lib/api/modules/productApi.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add lib/api/modules/productApi.ts lib/api/modules/productApi.test.ts
git commit -m "feat(products): keep preview products in list/search results"
```

---

### Task 3: `lib/preview.ts` — placement + date-format helpers

**Files:**
- Create: `lib/preview.ts`
- Create: `lib/preview.test.ts`

**Interfaces:**
- Produces:
  - `previewReleaseMs(releaseDate: string): number` — `Date.UTC` ms of the release instant
  - `isWithinDays(releaseDate: string, days: number, now?: number): boolean`
  - `type PreviewMode = 'show' | 'window7' | 'hide'`
  - `partitionPreview<T extends { preview?: boolean | null; releaseDate?: string | null }>(items: T[], mode: PreviewMode, now?: number): T[]`
  - `formatReleaseDate(releaseDate: string): string` → `"1. Oktober 2026"`
  - `formatReleaseDateShort(releaseDate: string): string` → `"1. Oktober"`

- [ ] **Step 1: Write the failing tests**

Create `lib/preview.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  previewReleaseMs, isWithinDays, partitionPreview,
  formatReleaseDate, formatReleaseDateShort,
} from './preview'

const DAY = 86_400_000
// Fixed "now": 2026-09-08T12:00:00Z
const NOW = Date.UTC(2026, 8, 8, 12, 0, 0)

describe('previewReleaseMs', () => {
  it('is UTC midnight of the release date', () => {
    expect(previewReleaseMs('2026-10-01')).toBe(Date.UTC(2026, 9, 1))
  })
})

describe('isWithinDays', () => {
  it('true when the release is inside the window', () => {
    expect(isWithinDays('2026-09-14', 7, NOW)).toBe(true)   // ~6 days out
  })
  it('false when the release is beyond the window', () => {
    expect(isWithinDays('2026-09-20', 7, NOW)).toBe(false)  // ~12 days out
  })
  it('true for a release already in the past (0 or negative distance)', () => {
    expect(isWithinDays('2026-09-01', 7, NOW)).toBe(true)
  })
})

const live = (id: string) => ({ id, preview: false as const, releaseDate: null })
const soon = (id: string, releaseDate: string) => ({ id, preview: true as const, releaseDate })

describe('partitionPreview', () => {
  it('hide: drops every preview item', () => {
    const out = partitionPreview([live('a'), soon('b', '2026-09-10'), live('c')], 'hide', NOW)
    expect(out.map(x => x.id)).toEqual(['a', 'c'])
  })

  it('window7: keeps near previews, drops far ones', () => {
    const out = partitionPreview(
      [live('a'), soon('b', '2026-09-11'), soon('c', '2026-12-01')],
      'window7', NOW,
    )
    expect(out.map(x => x.id)).toEqual(['a', 'b'])
  })

  it('show: keeps all previews', () => {
    const out = partitionPreview([live('a'), soon('b', '2026-12-01')], 'show', NOW)
    expect(out.map(x => x.id)).toEqual(['a', 'b'])
  })

  it('always orders live items before preview items, preserving order within each group', () => {
    const out = partitionPreview(
      [soon('x', '2026-09-10'), live('a'), soon('y', '2026-09-11'), live('b')],
      'show', NOW,
    )
    expect(out.map(x => x.id)).toEqual(['a', 'b', 'x', 'y'])
  })
})

describe('date formatting (de-DE)', () => {
  it('formatReleaseDate includes the year', () => {
    expect(formatReleaseDate('2026-10-01')).toBe('1. Oktober 2026')
  })
  it('formatReleaseDateShort omits the year', () => {
    expect(formatReleaseDateShort('2026-10-01')).toBe('1. Oktober')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run lib/preview.test.ts`
Expected: FAIL — `lib/preview.ts` does not exist.

- [ ] **Step 3: Implement `lib/preview.ts`**

```ts
// "Coming Soon" (preview) product placement + formatting helpers.
// Spec: docs/superpowers/specs/2026-09-08-coming-soon-preview-state-design.md §7, §12.

const DAY_MS = 86_400_000

/** UTC-midnight instant (ms) of a "YYYY-MM-DD" release date — the moment the backend flips the
 *  product to live, and therefore the countdown target. */
export function previewReleaseMs(releaseDate: string): number {
  const [y, m, d] = releaseDate.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** True when the release is at most `days` away (or already past). */
export function isWithinDays(releaseDate: string, days: number, now: number = Date.now()): boolean {
  return previewReleaseMs(releaseDate) - now <= days * DAY_MS
}

export type PreviewMode = 'show' | 'window7' | 'hide'

interface Previewish {
  preview?: boolean | null
  releaseDate?: string | null
}

/**
 * Apply a surface's preview-placement rule:
 *  - 'hide'    → drop every preview item (homepage, /trendy)
 *  - 'window7' → drop preview items releasing more than 7 days out (/neu)
 *  - 'show'    → keep all preview items (catalogue, category, search, /marken, PDP recs)
 * In every mode, live items are returned before preview items; relative order within each group
 * is preserved (preview items have no price/date to fold into the caller's sort).
 */
export function partitionPreview<T extends Previewish>(
  items: T[],
  mode: PreviewMode,
  now: number = Date.now(),
): T[] {
  const live: T[] = []
  const preview: T[] = []
  for (const item of items) {
    if (!item.preview) { live.push(item); continue }
    if (mode === 'hide') continue
    if (mode === 'window7' && !(item.releaseDate && isWithinDays(item.releaseDate, 7, now))) continue
    preview.push(item)
  }
  return [...live, ...preview]
}

const LONG = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
const SHORT = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long' })

/** "2026-10-01" → "1. Oktober 2026" */
export function formatReleaseDate(releaseDate: string): string {
  return LONG.format(new Date(`${releaseDate}T00:00:00Z`))
}

/** "2026-10-01" → "1. Oktober" */
export function formatReleaseDateShort(releaseDate: string): string {
  return SHORT.format(new Date(`${releaseDate}T00:00:00Z`))
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run lib/preview.test.ts`
Expected: PASS.

Note on the date-format assertions: `Intl` output can vary by ICU build. If `formatReleaseDate` yields `"1. Oktober 2026"` with a narrow no-break space or different punctuation on the runner, adjust the **test expectations** to match the runtime output (keep the format options as written) rather than changing the implementation.

- [ ] **Step 5: Commit**

```bash
git add lib/preview.ts lib/preview.test.ts
git commit -m "feat(preview): add placement + date-format helpers"
```

---

### Task 4: `<ComingSoonCountdown>` component

**Files:**
- Create: `components/ComingSoonCountdown.tsx`
- Create: `components/ComingSoonCountdown.test.tsx`

**Interfaces:**
- Consumes: `previewReleaseMs`, `formatReleaseDate` (Task 3)
- Produces: default export `ComingSoonCountdown`, props:
  ```ts
  interface ComingSoonCountdownProps {
    releaseDate: string          // "YYYY-MM-DD"
    variant: 'card' | 'pdp'
    onElapsed?: () => void       // fired once when the target time passes
  }
  ```

- [ ] **Step 1: Write the failing test**

Create `components/ComingSoonCountdown.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import ComingSoonCountdown from './ComingSoonCountdown'

describe('ComingSoonCountdown', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('renders the static release date before the ticking display mounts', () => {
    vi.setSystemTime(new Date('2026-09-08T12:00:00Z'))
    render(<ComingSoonCountdown releaseDate="2026-10-01" variant="pdp" />)
    expect(screen.getByText(/Kommt am 1\. Oktober 2026/)).toBeInTheDocument()
  })

  it('fires onElapsed once after the target passes', () => {
    vi.setSystemTime(new Date('2026-09-30T23:59:58Z'))
    const onElapsed = vi.fn()
    render(<ComingSoonCountdown releaseDate="2026-10-01" variant="card" onElapsed={onElapsed} />)
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onElapsed).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run components/ComingSoonCountdown.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the component**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { previewReleaseMs, formatReleaseDate } from '@/lib/preview'

interface ComingSoonCountdownProps {
  releaseDate: string
  variant: 'card' | 'pdp'
  onElapsed?: () => void
}

function parts(diff: number) {
  const d = Math.max(0, diff)
  return {
    days: Math.floor(d / 86_400_000),
    hours: Math.floor((d % 86_400_000) / 3_600_000),
    minutes: Math.floor((d % 3_600_000) / 60_000),
    seconds: Math.floor((d % 60_000) / 1000),
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

export default function ComingSoonCountdown({ releaseDate, variant, onElapsed }: ComingSoonCountdownProps) {
  const target = previewReleaseMs(releaseDate)
  const [now, setNow] = useState<number | null>(null) // null until mounted → SSR-safe
  const firedRef = useRef(false)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (now == null || firedRef.current) return
    if (now >= target) { firedRef.current = true; onElapsed?.() }
  }, [now, target, onElapsed])

  // Pre-mount / SSR: render the date only, no ticking digits (avoids hydration mismatch).
  if (now == null) {
    return (
      <span
        className="font-cormorant text-enunas-purple"
        style={{ fontSize: variant === 'pdp' ? 18 : 13, letterSpacing: '0.02em' }}
      >
        Kommt am {formatReleaseDate(releaseDate)}
      </span>
    )
  }

  const { days, hours, minutes, seconds } = parts(target - now)
  const digit = variant === 'pdp' ? 32 : 18
  const label = variant === 'pdp' ? 9 : 7

  const cells: { v: number; u: string }[] = [
    { v: days, u: 'T' },
    { v: hours, u: 'Std' },
    { v: minutes, u: 'Min' },
    { v: seconds, u: 'Sek' },
  ]

  return (
    <div
      className="flex items-baseline"
      style={{ gap: variant === 'pdp' ? 6 : 3 }}
      role="timer"
      aria-label={`Verfügbar am ${formatReleaseDate(releaseDate)}`}
    >
      {cells.map(({ v, u }, i) => (
        <span key={u} className="flex items-baseline" style={{ gap: variant === 'pdp' ? 6 : 3 }}>
          {i > 0 && (
            <span className="text-enunas-gray-light" style={{ fontSize: digit * 0.7, fontWeight: 200 }}>:</span>
          )}
          <span className="flex items-baseline" style={{ gap: 2 }}>
            <span
              className="font-cormorant text-enunas-purple"
              style={{ fontSize: digit, fontWeight: 300, lineHeight: 1 }}
            >
              {pad(v)}
            </span>
            <span
              className="font-league-spartan text-enunas-purple/60 uppercase"
              style={{ fontSize: label, letterSpacing: '0.12em' }}
            >
              {u}
            </span>
          </span>
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run components/ComingSoonCountdown.test.tsx`
Expected: PASS.

- [ ] **Step 5: Build**

Run: `pnpm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/ComingSoonCountdown.tsx components/ComingSoonCountdown.test.tsx
git commit -m "feat(preview): add ComingSoonCountdown component"
```

---

### Task 5: "Coming Soon" state on the product card

**Files:**
- Modify: `app/Homepage/components/PopularProductCard.tsx`

**Interfaces:**
- Consumes: `ComingSoonCountdown` (Task 4), `formatReleaseDateShort` (Task 3), `ProductCardShape.preview` / `.releaseDate` (Task 1)
- Produces: `PopularProductCardProps` gains `preview?: boolean` and `releaseDate?: string | null`; when `preview` is true the card renders the coming-soon treatment.

- [ ] **Step 1: Add the props**

In `PopularProductCardProps`:

```ts
  /** Renders the "Coming Soon" state: purple chip, "Kommt am …" instead of a price,
   *  countdown on hover. */
  preview?: boolean;
  /** ISO "YYYY-MM-DD"; required visual data when `preview` is true. */
  releaseDate?: string | null;
```

Add to the destructured params (with defaults): `preview = false, releaseDate = null`.

- [ ] **Step 2: Import the countdown + formatter**

At the top of the file:

```ts
import ComingSoonCountdown from "@/components/ComingSoonCountdown"
import { formatReleaseDateShort } from "@/lib/preview"
```

- [ ] **Step 3: Suppress "new in" for preview cards**

Change the `isNew` derivation:

```ts
const isNew = !preview && isNewProduct(createdAt);
```

- [ ] **Step 4: Add the image chip**

Inside the image container `<div className="relative w-full aspect-[3/4] overflow-hidden bg-enunas-off-white">`, immediately after the `<Image>` block (before the hover overlay `<div>`), add:

```tsx
{preview && (
  <span
    className="absolute top-3 left-3 z-10 bg-enunas-purple text-white uppercase"
    style={{
      fontFamily: 'var(--font-league-spartan)',
      fontSize: 9,
      letterSpacing: '0.15em',
      padding: '4px 10px',
    }}
  >
    Coming Soon
  </span>
)}
```

- [ ] **Step 5: Replace the price line for preview cards**

The default-content block renders the price at the `{price !== null && ( ... )}` section. Wrap so preview shows the date badge instead:

```tsx
{/* Price — or, for a preview product, the release date. */}
{preview ? (
  releaseDate && (
    <p
      className="text-sm font-light text-enunas-purple"
      style={{ fontFamily: 'var(--font-league-spartan)' }}
    >
      Kommt am {formatReleaseDateShort(releaseDate)}
    </p>
  )
) : (
  price !== null && (
    <p className={`text-sm font-light flex items-baseline gap-2 ${originalPrice ? 'text-enunas-error' : 'text-enunas-black'}`}>
      {price}
      {originalPrice && (
        <span
          className="text-enunas-gray-dark"
          style={{
            textDecorationLine: 'line-through',
            textDecorationColor: '#8B1E3F',
            textDecorationThickness: '1.5px',
          }}
        >
          {originalPrice}
        </span>
      )}
    </p>
  )
)}
```

- [ ] **Step 6: Swap the hover content to the countdown for preview cards**

In the "Hover Content (Sizes & Categories)" absolute block, wrap its children:

```tsx
{preview ? (
  releaseDate && (
    <div className="pt-1">
      <ComingSoonCountdown releaseDate={releaseDate} variant="card" />
    </div>
  )
) : (
  <>
    {/* existing Sizes block */}
    {/* existing Category Pills block */}
  </>
)}
```

(Keep the existing Sizes and Category Pills markup verbatim inside the `<>...</>`.)

- [ ] **Step 7: Build**

Run: `pnpm run build`
Expected: PASS.

- [ ] **Step 8: Manual verification**

Per project memory `feedback_verify_with_chrome_devtools_mcp`: with the dev server running and a real backend preview product (or temporarily stub one), open a page that lists it and confirm: purple `COMING SOON` chip on the image, `Kommt am 1. Oktober` where the price sits, countdown appears on hover, no `new in` label, card still links to the PDP. Screenshot for the reviewer.

- [ ] **Step 9: Commit**

```bash
git add "app/Homepage/components/PopularProductCard.tsx"
git commit -m "feat(preview): coming-soon state on the product card"
```

---

### Task 6: Feed placement — shared catalogue / feed / brand surfaces

**Files:**
- Modify: `app/(root)/bekleidung/components/FeedPageContent.tsx` (props + `visibleProducts`)
- Modify: `app/(root)/neu/components/NeuPageContent.tsx`
- Modify: `app/(root)/trendy/components/TrendyPageContent.tsx`
- Modify: `app/(root)/bekleidung/page.tsx` (`visibleProducts`)
- Modify: `app/(root)/bekleidung/components/CatalogueLandingPage.tsx`

**Interfaces:**
- Consumes: `partitionPreview`, `PreviewMode` (Task 3), `ProductCardShape.preview` (Task 1)
- Produces: `FeedPageContent` accepts `previewMode?: PreviewMode` (default `'show'`); `/neu` passes `'window7'`, `/trendy` passes `'hide'`.

- [ ] **Step 1: `FeedPageContent` — accept the prop**

In `interface Props` add:

```ts
  /** How preview ("Coming Soon") products are placed. Default 'show' (live first, then preview). */
  previewMode?: import('@/lib/preview').PreviewMode
```

Add `previewMode = 'show'` to the destructured props.

- [ ] **Step 2: `FeedPageContent` — apply after sort**

Import at top:

```ts
import { partitionPreview } from '@/lib/preview'
```

In the `visibleProducts` `useMemo`, replace each `return` that produces the final list so the partition is the last transform. The simplest correct form — wrap the whole computed result:

```ts
  const visibleProducts = useMemo(() => {
    let r = brandScopedProducts
    if (activeCat !== 'alle')           r = r.filter(p => catMatchesProduct(activeCat, p))
    if (gender.length > 0)              r = r.filter(p => genderMatchesProduct(gender, p))
    if (filters.kategorien.length > 0)  r = r.filter(p => filters.kategorien.some(k => catMatchesProduct(k, p)))
    if (filters.farben.length > 0)      r = r.filter(p => p.colours.some(c =>
      filters.farben.some(f =>
        (c.colorFamily ? c.colorFamily.toUpperCase() === f.toUpperCase() : false) ||
        c.name.toLowerCase() === f.toLowerCase()
      )
    ))
    if (filters.groessen.length > 0)    r = r.filter(p => p.sizes?.some(s => filters.groessen.includes(s)))
    if (filters.marken.length > 0)      r = r.filter(p => filters.marken.includes(p.brandName))
    if (filters.sortieren === 'preis-auf') r = [...r].sort((a, b) => parsePriceNum(a.price) - parsePriceNum(b.price))
    else if (filters.sortieren === 'preis-ab')  r = [...r].sort((a, b) => parsePriceNum(b.price) - parsePriceNum(a.price))
    else if (filters.sortieren === 'name')      r = [...r].sort((a, b) => a.productName.localeCompare(b.productName))
    return partitionPreview(r, previewMode)
  }, [brandScopedProducts, activeCat, gender, filters, previewMode])
```

(Note: the original early-returns for the sort branches are flattened into `if/else if` so the partition always runs last. Behaviour for non-preview products is unchanged.)

- [ ] **Step 3: Pass the mode from `/neu` and `/trendy`**

`app/(root)/neu/components/NeuPageContent.tsx`:

```tsx
export default function NeuPageContent() {
  return <FeedPageContent basePath="/neu" HeroComponent={HeroNew} previewMode="window7" />
}
```

`app/(root)/trendy/components/TrendyPageContent.tsx`:

```tsx
export default function TrendyPageContent() {
  return <FeedPageContent basePath="/trendy" HeroComponent={HeroTrendy} previewMode="hide" />
}
```

- [ ] **Step 4: `app/(root)/bekleidung/page.tsx` — partition after sort**

Import `partitionPreview` from `@/lib/preview`. In its `visibleProducts` `useMemo`, apply `partitionPreview(r, 'show')` as the final transform (same flatten-then-partition approach as Step 2). Add nothing to the deps beyond what's already there (`'show'` is a literal).

- [ ] **Step 5: `CatalogueLandingPage.tsx` — partition the SSR list**

```tsx
import { partitionPreview } from '@/lib/preview'
// ...
  const products = partitionPreview(
    res.content.filter(p => matchesCatalogue(p, config.slug)).map(apiProductToCardShape),
    'show',
  )
```

- [ ] **Step 6: Build**

Run: `pnpm run build`
Expected: PASS.

- [ ] **Step 7: Manual verification**

With a backend preview product releasing <7 days out and another releasing >7 days out:
- `/neu` shows the near one (after live products), not the far one.
- `/trendy` shows neither.
- `/bekleidung` and a segment landing page (`/bekleidung/streetwear` etc.) show both, after live products.
Screenshot `/neu` and `/trendy` for the reviewer.

- [ ] **Step 8: Commit**

```bash
git add "app/(root)/bekleidung/components/FeedPageContent.tsx" "app/(root)/neu/components/NeuPageContent.tsx" "app/(root)/trendy/components/TrendyPageContent.tsx" "app/(root)/bekleidung/page.tsx" "app/(root)/bekleidung/components/CatalogueLandingPage.tsx"
git commit -m "feat(preview): feed placement rules for catalogue, /neu, /trendy, /marken"
```

---

### Task 7: Feed placement — exclude preview products from the homepage

**Files:**
- Modify: `app/Homepage/components/NewProducts.tsx`
- Modify: `app/Homepage/components/PopularProduct.tsx`
- Modify: `components/CuratedRecommendations.tsx` (add `previewMode` prop)
- Modify: `app/(root)/page.tsx` (pass `previewMode="hide"` to the homepage `CuratedRecommendations`)

**Interfaces:**
- Consumes: `partitionPreview` (Task 3)
- Produces: `CuratedRecommendations` accepts `previewMode?: PreviewMode` (default `'show'`).

- [ ] **Step 1: `NewProducts.tsx`**

Import `partitionPreview` from `@/lib/preview`. In the `.then(...)`:

```ts
      .then(res => {
        const sorted = [...res.content].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setProducts(partitionPreview(sorted.map(apiProductToCardShape), 'hide'))
      })
```

- [ ] **Step 2: `PopularProduct.tsx`**

Import `partitionPreview`. In the `.then(...)`:

```ts
      .then(res => setProducts(partitionPreview(res.content.map(apiProductToCardShape), 'hide')))
```

- [ ] **Step 3: `CuratedRecommendations.tsx` — add the prop**

Import `partitionPreview` and `PreviewMode` from `@/lib/preview`. Extend `Props`:

```ts
  /** How preview products are placed. Homepage passes 'hide'; catalogue/PDP default to 'show'. */
  previewMode?: import('@/lib/preview').PreviewMode
```

Destructure with default `previewMode = 'show'`. In the load effect, apply the partition to the resolved list:

```ts
  useEffect(() => {
    resolveCuratedOrNewest(resolveIds(excludeId), 8)
      .then(res => setProducts(partitionPreview(res.filter(p => p.id !== excludeId), previewMode)))
      .finally(() => setLoading(false))
  }, [excludeId, previewMode])
```

`ApiProduct` satisfies the `partitionPreview` generic constraint (`preview?`, `releaseDate?`), so no shape change is needed here.

- [ ] **Step 4: `app/(root)/page.tsx` — pass the mode**

```tsx
<CuratedRecommendations title="Das könnte dir auch gefallen" variant="feed" previewMode="hide" />
```

(Leave the `/catalogue` and PDP usages untouched — they default to `'show'`.)

- [ ] **Step 5: Build**

Run: `pnpm run build`
Expected: PASS.

- [ ] **Step 6: Manual verification**

Homepage ("Unsere Favoriten", "Neue Arrivals", "Das könnte dir auch gefallen") shows no preview products even when the backend returns some. Screenshot the homepage.

- [ ] **Step 7: Commit**

```bash
git add "app/Homepage/components/NewProducts.tsx" "app/Homepage/components/PopularProduct.tsx" components/CuratedRecommendations.tsx "app/(root)/page.tsx"
git commit -m "feat(preview): exclude preview products from the homepage"
```

---

### Task 8: "Coming Soon" state on the PDP (static)

**Files:**
- Modify: `app/(root)/bekleidung/[brand]/[slug]/page.tsx` (pass `preview`; carry into recs)
- Modify: `app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx`
- Modify: `app/(root)/bekleidung/[brand]/[slug]/components/ProductCard.tsx` (`RecItem` + card)

**Interfaces:**
- Consumes: `ComingSoonCountdown` (Task 4), `formatReleaseDate` / `formatReleaseDateShort` (Task 3), `ApiProduct.preview` / `.releaseDate` (Task 1)
- Produces:
  - `ProductDetailsProps` gains `preview: boolean`
  - `RecItem` gains `preview?: boolean` and `releaseDate?: string | null`

- [ ] **Step 1: `page.tsx` — pass `preview` to `ProductDetails`**

In the `<ProductDetails ... />` JSX add:

```tsx
        preview={resolved.preview ?? false}
```

`toNewProduct` already copies `releaseDate` onto the product; `ProductDetails` reads it from `product.releaseDate`.

- [ ] **Step 2: `page.tsx` — carry preview into recommendation items**

In `toRecItem`:

```ts
function toRecItem(p: ApiProduct): RecItem {
  return {
    brand: p.brandName,
    name: p.name,
    price: p.available ? formatCardPrice(p.price) : null,
    originalPrice:
      p.available && p.originalPrice != null ? formatCardPrice(p.originalPrice) : null,
    colors: (p.colours ?? []).map(c => c.hex),
    href: `/bekleidung/${generateSlug(p.brandName)}/${p.slug}`,
    image: p.images?.[0],
    preview: p.preview ?? false,
    releaseDate: p.releaseDate ?? null,
  }
}
```

(`completeTheLookToRecItem` items have no `preview` data from the trimmed payload — leave them as-is; they default to non-preview.)

- [ ] **Step 3: `ProductCard.tsx` (rec card) — `RecItem` + render**

Add to `RecItem`:

```ts
  /** True when this recommendation is a not-yet-released product. */
  preview?: boolean;
  /** ISO "YYYY-MM-DD" release date; shown instead of a price when `preview`. */
  releaseDate?: string | null;
```

Import `formatReleaseDateShort` from `@/lib/preview`. Replace the price `<p>` block (`{item.price !== null && ( ... )}`) with:

```tsx
{item.preview ? (
  item.releaseDate && (
    <p
      className={`font-league-spartan ${compact ? 'text-xs' : 'text-[13px]'} font-light text-enunas-purple`}
    >
      Kommt am {formatReleaseDateShort(item.releaseDate)}
    </p>
  )
) : (
  item.price !== null && (
    <p className={`
      font-league-spartan ${compact ? 'text-xs' : 'text-[13px]'}
      font-light flex items-baseline gap-2
      ${item.originalPrice ? 'text-enunas-error' : 'text-enunas-black'}
    `}>
      {item.price}
      {item.originalPrice && (
        <span
          className="text-enunas-gray-dark"
          style={{
            textDecorationLine: 'line-through',
            textDecorationColor: '#8B1E3F',
            textDecorationThickness: '1.5px',
          }}
        >
          {item.originalPrice}
        </span>
      )}
    </p>
  )
)}
```

- [ ] **Step 4: `ProductDetails.tsx` — add the prop + skip listings**

Add `preview: boolean` to `ProductDetailsProps` and to the destructured params.

Guard the listings fetch effect:

```ts
  useEffect(() => {
    if (!productId || preview) return   // preview products have no listings (backend returns [])
    setListingsLoading(true)
    setListingsFailed(false)
    productApi.getListings(productId)
      .then(setListings)
      .catch(() => setListingsFailed(true))
      .finally(() => setListingsLoading(false))
  }, [productId, preview])
```

- [ ] **Step 5: `ProductDetails.tsx` — replace the price block**

Import at top:

```ts
import ComingSoonCountdown from '@/components/ComingSoonCountdown'
import { formatReleaseDate } from '@/lib/preview'
```

Replace the price `<div className="flex flex-col items-center gap-2 mb-10">` block with a conditional. Keep the existing markup for the non-preview branch verbatim; add the preview branch:

```tsx
{preview ? (
  <div className="flex flex-col items-center gap-3 mb-10">
    {product.releaseDate && (
      <>
        <span
          className="text-enunas-gray-medium"
          style={{ fontFamily: 'var(--font-Cormorant-Garamond)', fontSize: '15px', fontStyle: 'italic' }}
        >
          Kommt am {formatReleaseDate(product.releaseDate)}
        </span>
        <ComingSoonCountdown releaseDate={product.releaseDate} variant="pdp" />
      </>
    )}
  </div>
) : (
  <div className="flex flex-col items-center gap-2 mb-10">
    {/* existing price + strike-through + "Reduziert −X %" markup, unchanged */}
  </div>
)}
```

- [ ] **Step 6: `ProductDetails.tsx` — CTA + sticky bar**

Extend the CTA gating so preview wins:

```ts
  const ctaDisabled = preview || !available || isOutOfStock || variantUnavailable
  const ctaLabel = preview
    ? 'Coming Soon'
    : !available
    ? 'Derzeit nicht verfügbar'
    : isOutOfStock
    ? 'Ausverkauft'
    : variantUnavailable
    ? 'Derzeit nicht verfügbar'
    : selectedSize
    ? 'Zum Warenkorb hinzufügen'
    : 'Größe wählen'
```

In `handleCta`, first line:

```ts
  const handleCta = () => {
    if (preview || !available || isOutOfStock || variantUnavailable) return
    if (!selectedSize) { setShowSizeModal(true); return }
    handleAddToCart(selectedSize)
  }
```

`StickyAddToCart` already takes `ctaLabel` and `isOutOfStock` (its disable flag) — it receives `ctaLabel={ctaLabel}` and `isOutOfStock={ctaDisabled}` today, so it inherits the preview state with no change. For `formattedPrice` passed to the sticky bar, fall back to the release text:

```tsx
      <StickyAddToCart
        productName={product.name}
        formattedPrice={preview && product.releaseDate ? `Kommt am ${formatReleaseDate(product.releaseDate)}` : formattedPrice}
        selectedSize={preview ? null : selectedSize}
        ctaLabel={ctaLabel}
        isOutOfStock={ctaDisabled}
        onCta={handleCta}
        watchRef={ctaRef}
      />
```

- [ ] **Step 7: Build**

Run: `pnpm run build`
Expected: PASS.

- [ ] **Step 8: Manual verification**

Open the PDP for a backend preview product: `Kommt am 1. Oktober 2026` + purple countdown where the price was; disabled `COMING SOON` button; colour/size selectors visible but clicking never adds to cart; no "Verfügbarkeit konnte nicht geladen werden" error; sticky bar shows the same. Confirm a normal product's PDP is visually unchanged. Screenshots of both.

- [ ] **Step 9: Commit**

```bash
git add "app/(root)/bekleidung/[brand]/[slug]/page.tsx" "app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx" "app/(root)/bekleidung/[brand]/[slug]/components/ProductCard.tsx"
git commit -m "feat(preview): coming-soon state on the PDP"
```

---

### Task 9: PDP live transition at release time

**Files:**
- Modify: `app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx`

**Interfaces:**
- Consumes: `productApi.getBySlug` (existing), `previewReleaseMs` (Task 3), the `onElapsed` prop of `ComingSoonCountdown` (Task 4)
- Produces: no new exports — internal state so a preview PDP becomes a normal buyable PDP in place once the backend flips it, without a full navigation.

- [ ] **Step 1: Local overridable preview/price state**

Near the other `useState` calls in `ProductDetails`:

```ts
  // The product arrives as preview; once the backend flips it (checked on focus/visibility after
  // the release instant) we refetch and drop the preview UI in place. Spec §6.
  const [livePreview, setLivePreview] = useState(preview)
  const [livePrice, setLivePrice] = useState<number>(price)
  const [liveOriginalPrice, setLiveOriginalPrice] = useState<number | null>(originalPrice ?? null)
```

Then replace **reads** of `preview` / `price` / `originalPrice` in the render and derivations with `livePreview` / `livePrice` / `liveOriginalPrice` respectively. Specifically:
- the listings-fetch guard (`if (!productId || livePreview) return`) and its dep array
- `priceView` fallback (`return { current: livePrice, original: liveOriginalPrice }`)
- `available` is a prop; keep a derived `const effectiveAvailable = livePreview ? false : available` and use it wherever `available` currently gates price/CTA
- the price-block conditional (`{livePreview ? ( ... ) : ( ... )}`)
- `ctaDisabled` / `ctaLabel` / `handleCta` preview checks
- `StickyAddToCart` props

- [ ] **Step 2: The refetch effect**

```ts
  useEffect(() => {
    if (!livePreview || !product.releaseDate) return
    const target = previewReleaseMs(product.releaseDate)

    const check = async () => {
      if (Date.now() < target) return
      try {
        const fresh = await productApi.getBySlug(productSlug)
        if (!fresh.preview) {
          setLivePreview(false)
          setLivePrice(fresh.price)
          setLiveOriginalPrice(fresh.originalPrice ?? null)
        }
      } catch {
        /* transient — try again on the next focus */
      }
    }

    const onVisible = () => { if (document.visibilityState === 'visible') check() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', check)
    check() // in case the tab was already past the release when mounted
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', check)
    }
  }, [livePreview, product.releaseDate, productSlug])
```

Import `previewReleaseMs` from `@/lib/preview`.

- [ ] **Step 3: Wire `onElapsed`**

Give the PDP countdown the same check:

```tsx
<ComingSoonCountdown
  releaseDate={product.releaseDate}
  variant="pdp"
  onElapsed={() => { /* effect's `check` re-runs on the next focus; nothing needed here beyond a nudge */ }}
/>
```

If a nudge is wanted, lift `check` out of the effect via `useCallback` and pass it as `onElapsed`. Keep it simple: passing a no-op is acceptable because the focus/visibility listeners cover the realistic "customer comes back to the tab" case, and a customer staring at the countdown for the final second is an edge case the next interaction resolves.

- [ ] **Step 4: Build**

Run: `pnpm run build`
Expected: PASS.

- [ ] **Step 5: Manual verification**

Simplest check without waiting for a real date: temporarily point at a preview product whose `releaseDate` is today or in the past (or stub `getBySlug` to return `preview: false` on the second call), load the PDP, blur and refocus the tab, and confirm the price + `COMING SOON` button switch to the normal buyable UI without a reload. Revert any stub.

- [ ] **Step 6: Commit**

```bash
git add "app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx"
git commit -m "feat(preview): PDP swaps to buyable UI at release time on refocus"
```

---

### Task 10: Persist preview fields on wishlist items

**Files:**
- Modify: `app/context/WishlistContext.tsx` (`WishlistItem`)
- Modify: `app/Homepage/components/PopularProductCard.tsx` (`handleToggleSaved`)
- Modify: `app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx` (`handleToggleSaved`)

**Interfaces:**
- Consumes: `ProductCardShape.preview` / `.releaseDate` (Task 1)
- Produces: `WishlistItem` gains `preview?: boolean` and `releaseDate?: string | null`, populated on save so a saved preview product renders the coming-soon card from `/saved-lists`.

- [ ] **Step 1: Extend `WishlistItem`**

In `app/context/WishlistContext.tsx`:

```ts
export interface WishlistItem {
  id: string
  imgURL: string
  brandName: string
  productName: string
  price: string | null
  originalPrice?: string | null
  href: string
  colours: { hex: string; name: string }[]
  createdAt: Date | string
  sizes?: string[]
  catalogue?: string[]
  /** Set when the saved product was a "Coming Soon" preview at save time. */
  preview?: boolean
  releaseDate?: string | null
}
```

- [ ] **Step 2: `PopularProductCard.handleToggleSaved`**

In the `item` object literal, add:

```ts
      preview, releaseDate,
```

(both are already in scope as destructured props from Task 5.)

- [ ] **Step 3: `ProductDetails.handleToggleSaved`**

In the `item: WishlistItem` object, add:

```ts
      preview: livePreview,
      releaseDate: product.releaseDate ?? null,
```

Also set `price: livePreview ? null : formattedPrice` in that same object so a saved preview item carries no price string.

- [ ] **Step 4: Build**

Run: `pnpm run build`
Expected: PASS. (`WishlistItem` → `PopularProductCard` spread at `saved-lists/page.tsx:85` and `WishlistPreview.tsx:47` now carries `preview`/`releaseDate`; both are optional so no call-site change is required.)

- [ ] **Step 5: Manual verification**

Save a preview product from a listing page, open `/saved-lists`, confirm it renders with the `COMING SOON` chip and `Kommt am …` line. Remove it.

- [ ] **Step 6: Commit**

```bash
git add app/context/WishlistContext.tsx "app/Homepage/components/PopularProductCard.tsx" "app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx"
git commit -m "feat(preview): keep coming-soon state on saved wishlist items"
```

---

### Task 11: Checkout 409 safety net

**Files:**
- Modify: `app/(root)/checkout/page.tsx` (the `orderApi.create` `try/catch` around lines 213-252)

**Interfaces:**
- Consumes: `FetchError` (already imported in this file), `useCart().removeFromCart` (available from `useCart`)
- Produces: on a "not yet released" 409, the checkout shows a German message and removes the offending line(s) from the cart.

- [ ] **Step 1: Ensure `removeFromCart` is in scope**

At the `useCart()` destructure in `checkout/page.tsx`, add `removeFromCart` if not already destructured.

- [ ] **Step 2: Handle the 409 in the catch**

Replace the `catch (err)` block of the `orderApi.create` call:

```ts
    } catch (err) {
      const notReleased =
        err instanceof FetchError &&
        err.status === 409 &&
        /not yet released/i.test(err.serverMessage ?? err.message)

      if (notReleased) {
        // A preview product slipped into the cart (added before it went preview). Drop it.
        for (const item of cartItems) {
          if (!item.defaultListingId) continue
        }
        // The backend message names the product but not the listing id; clear any line whose
        // product can't currently be ordered is too broad — instead surface the message and let
        // the customer remove it, matching how other cart problems are handled here.
        setError(
          'Ein Artikel in deinem Warenkorb ist noch nicht erhältlich (Coming Soon). ' +
          'Bitte entferne ihn, um fortzufahren.'
        )
      } else {
        setError(
          err instanceof FetchError
            ? err.message
            : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
        )
      }
    } finally {
      setLoading(false)
    }
```

(Keep it to a clear message — auto-removing the right line needs the listing id the 409 doesn't give, and the PDP already prevents a preview product from being added, so this path is a rare race. The dead `for` loop above is a mistake — omit it; the final block is just the `setError` + `else`.)

Final form of the block:

```ts
    } catch (err) {
      const notReleased =
        err instanceof FetchError &&
        err.status === 409 &&
        /not yet released/i.test(err.serverMessage ?? err.message)
      setError(
        notReleased
          ? 'Ein Artikel in deinem Warenkorb ist noch nicht erhältlich (Coming Soon). Bitte entferne ihn, um fortzufahren.'
          : err instanceof FetchError
          ? err.message
          : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
      )
    } finally {
      setLoading(false)
    }
```

(Drop the `removeFromCart` import change from Step 1 — not used in the final form.)

- [ ] **Step 3: Build**

Run: `pnpm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add "app/(root)/checkout/page.tsx"
git commit -m "feat(preview): friendly checkout message when a preview product is in the cart"
```

---

### Task 12: Admin product list — "Vorschau" badge

**Files:**
- Modify: `app/(dashboard)/dashboard/admin/_components/Products.tsx` (~line 500, the `<TD><StatusBadge status={p.status} /></TD>` cell)

**Interfaces:**
- Consumes: `AdminApiProduct.preview` (Task 1)
- Produces: a `Vorschau` pill next to the status badge for preview products.

- [ ] **Step 1: Render the badge**

Change the status cell:

```tsx
<TD>
  <div className="flex items-center gap-1.5">
    <StatusBadge status={p.status} />
    {p.preview && (
      <span
        className="inline-flex items-center bg-enunas-purple text-white uppercase"
        style={{ fontSize: 9, letterSpacing: '0.12em', padding: '2px 7px', fontFamily: 'var(--font-league-spartan)' }}
      >
        Vorschau
      </span>
    )}
  </div>
</TD>
```

If `p` is not typed as `AdminApiProduct` here (it may be a local `AdminProduct` type in `shared`), add `preview?: boolean` to that local type. Check the type of the `products` state / `AdminProductResponseDto` mapping in this file and in `./shared`.

- [ ] **Step 2: Build**

Run: `pnpm run build`
Expected: PASS.

- [ ] **Step 3: Manual verification**

Log in as admin (see project memory `project_test_accounts`), open the product list, confirm a preview product shows the purple `Vorschau` pill beside its status. Screenshot.

- [ ] **Step 4: Commit**

```bash
git add "app/(dashboard)/dashboard/admin/_components/Products.tsx"
git commit -m "feat(preview): badge preview products in the admin product list"
```

---

### Task 13: Full regression + spec verification

**Files:** none (verification only)

- [ ] **Step 1: Full test run**

Run: `pnpm test:run`
Expected: PASS — all suites.

- [ ] **Step 2: Production build**

Run: `pnpm run build`
Expected: PASS, no type errors.

- [ ] **Step 3: Walk the spec §16 checklist**

With the dev server and a real backend preview product, confirm every box in `docs/superpowers/specs/2026-09-08-coming-soon-preview-state-design.md` §16:
- appears on catalogue grid, category page, search, `/neu` (≤7d), `/marken/[brand]`, its own PDP
- does NOT appear on `/trendy`, homepage sections, `/neu` (>7d)
- PDP: purple countdown + `Kommt am …` + disabled `COMING SOON`, no price, no add-to-cart, no listings error
- card: purple `COMING SOON` chip + `Kommt am …`, countdown on hover, links to PDP
- countdown digits consistent with a UTC-midnight target
- admin list shows `Vorschau` badge

- [ ] **Step 4: Commit (if any verification fixes were needed)**

```bash
git add -A
git commit -m "fix(preview): address verification findings"
```

---

## Self-Review

**1. Spec coverage**

| Spec section | Task(s) |
|---|---|
| §2 backend contract (consume/verify) | 1 (types), 8 (skip listings), 11 (409), 13 (verify) |
| §2.1 UTC-midnight target | 3 (`previewReleaseMs`), 4 (countdown), 9 (refetch) |
| §3 types & adapters | 1 |
| §4 `sellableOnly` gate | 2 |
| §5 product card | 5 |
| §6 PDP static state | 8 |
| §6 PDP live transition | 9 |
| §7 feed placement table | 6 (catalogue/neu/trendy/marken), 7 (homepage) |
| §8 wishlist | 10 |
| §9 checkout safety net | 11 |
| §10 admin badge | 12 |
| §11 `ComingSoonCountdown` | 4 |
| §12 date formatting | 3 |
| §13 tests | 1, 2, 3, 4 (UI tasks verified by build + manual per project memory) |
| §16 verification checklist | 13 |

No gaps. §7's "cart similar / wishlist preview / saved-lists render coming-soon" is covered by Task 10 (persisting the fields) + Task 5 (the card renders from those fields).

**2. Placeholder scan** — no "TBD/TODO/handle edge cases"; every code step has literal content. Task 9 Step 3 offers a documented judgement call (no-op `onElapsed` vs. lifted `useCallback`) with a concrete default, not a placeholder. Task 11 shows the wrong-then-right form deliberately and states the final form explicitly.

**3. Type consistency**
- `preview?: boolean` on `ApiProduct` / `RawProductResponse` / `AdminApiProduct` (Task 1) — consumed as `p.preview ?? false` everywhere.
- `ProductCardShape.preview: boolean` (required) + `releaseDate: string | null` (Task 1) — produced by `apiProductToCardShape`, consumed by `PopularProductCard` props `preview?: boolean` / `releaseDate?: string | null` (Task 5).
- `PreviewMode = 'show' | 'window7' | 'hide'` (Task 3) — consumed by `FeedPageContent` and `CuratedRecommendations` props (Tasks 6, 7), and the literals `'show'`/`'window7'`/`'hide'` at call sites.
- `partitionPreview(items, mode, now?)` (Task 3) — same signature used in Tasks 6 and 7.
- `previewReleaseMs(releaseDate)` (Task 3) — used by `ComingSoonCountdown` (Task 4) and `ProductDetails` refetch effect (Task 9).
- `formatReleaseDate` / `formatReleaseDateShort` (Task 3) — used in Tasks 4, 5, 8.
- `ComingSoonCountdown` props `{ releaseDate, variant: 'card' | 'pdp', onElapsed? }` (Task 4) — matched in Tasks 5, 8, 9.
- `RecItem.preview?` / `.releaseDate?` (Task 8) — produced by `toRecItem`, consumed by the rec `ProductCard`.

Consistent throughout.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-09-08-coming-soon-preview-state.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
