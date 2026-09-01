# Backend Handoff Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Enunas Next.js frontend in line with four rounds of backend changes — the 401/403 split, the new error envelope, gated listing endpoints, nullable Complete-The-Look prices, persisted PENDING orders, per-brand shipments, and DSGVO account erasure.

**Architecture:** Changes concentrate in the API layer (`lib/api/`), where a new status→German copy map and a token-aware 401 handler live, and in the presentation layer where the new/changed response shapes surface (PDP, account orders, account settings, vendor products, cart/checkout). Pure logic is extracted into testable modules (`lib/api/errorCopy.ts`, `lib/orderShipments.ts`, `lib/cart-logic.ts`, `lib/pricing.ts`); React components consume them.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Vitest (`pnpm test:run`), pnpm.

**Spec:** The two backend handoff documents pasted into the originating conversation ("Enunas Backend Handoff" — exception handling / security chain / listings, and "Backend → Frontend · Enunas" — nine API-visible changes), plus two user-added items: remove the €50 free-shipping logic, and stop letting out-of-stock variants reach the local cart.

## Global Constraints

- CLAUDE.md hard constraints apply: only touch what these tasks name, no unsolicited refactoring, no docstrings/comments added to untouched code.
- `pnpm run build` must pass after every task that changes TypeScript. `pnpm exec vitest run` must pass after every task.
- All user-facing copy is German. Backend `message` values are English and must not be rendered verbatim except where a task says so explicitly.
- Colors from the Enunas tokens only (`enunas-purple` `#370E4D`, `enunas-error` `#8B1E3F`, `enunas-warning` `#7A5C1E`, `enunas-success` `#1A5A3C`, `enunas-gray-medium` `#6B6B6B`, `enunas-gray-light` `#E8E8E8`, `enunas-off-white` `#F5F5F0`).
- Typography: `font-league-spartan` for labels/body, `font-cormorant` for headings. Uppercase labels use `tracking-[0.2em]` and `text-[11px]`.
- Animations: `ease-out-expo` / `ease-out-quart` only; animate `transform`/`opacity` only.
- Account-deletion endpoint is `DELETE /customer/me` (per the detailed handoff, matching the existing `/customer/me` resource). The summary table's `DELETE /account` is treated as shorthand for the same thing.
- `/products/{id}/listings` keeps its `List` shape; only `GET /listings` became a `Page`. Client code is written to tolerate both.

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `lib/api/errorCopy.ts` | Pure status→German-copy map. No React, no fetch. | Create |
| `lib/api/errorCopy.test.ts` | Unit tests for the map. | Create |
| `lib/api/fetcher.ts` | Token-aware 401 handling; delegates copy to `errorCopy`; keeps the English server string on `FetchError.serverMessage`. | Modify |
| `lib/api/fetcher.test.ts` | Add 401/token and error-envelope tests. | Modify |
| `lib/api/modules/listingApi.ts` | `GET /listings` (paged, region-aware) and `GET /listings/{id}`. | Create |
| `lib/api/modules/listingApi.test.ts` | Tests for query building + page normalisation. | Create |
| `lib/api/modules/productApi.ts` | `getListings` tolerates array-or-page; corrected auth comment. | Modify |
| `lib/api/modules/productApi.test.ts` | Add `getListings` shape tests. | Modify |
| `lib/api/modules/customerApi.ts` | `deleteMe()` for DSGVO erasure. | Modify |
| `lib/api/index.ts` | Barrel exports for the new module/types. | Modify |
| `lib/api/productResponseAdapter.ts` | Map `completeTheLookProducts` (nullable price). | Modify |
| `lib/api/productResponseAdapter.test.ts` | Tests for the new mapping. | Modify |
| `types/api.ts` | `ApiCompleteTheLookItem`, `ApiOrderShipment`, `OrderShipmentStatus`, `ARCHIVED` product status, `shipments` on `ApiOrder`. | Modify |
| `lib/orderShipments.ts` | Pure per-brand shipment presentation helper. | Create |
| `lib/orderShipments.test.ts` | Tests for the helper. | Create |
| `lib/pricing.ts` | Drop the €50 threshold; flat pre-address estimate only. | Modify |
| `lib/pricing.test.ts` | Update to the new contract. | Modify |
| `lib/cart-logic.ts` | Stock-aware `addItem`/`updateQty`. | Modify |
| `lib/cart-logic.test.ts` | Stock-clamp tests. | Modify |
| `app/context/CartContext.tsx` | `stockQuantity` on `CartItem`. | Modify |
| `app/(root)/cart/constants.ts` | Drop `FREE_SHIPPING_THRESHOLD`. | Modify |
| `app/(root)/cart/components/CartSummary.tsx` | Flat shipping estimate. | Modify |
| `app/(root)/cart/components/CartSidebar.tsx` | Remove free-shipping progress bar. | Modify |
| `app/(root)/cart/components/FreeShippingBar.tsx` | Dead component. | Delete |
| `app/(root)/cart/page.tsx` | Remove the commented-out `FreeShippingBar` import/usage. | Modify |
| `app/(root)/(footer)/faqs/page.tsx` | Correct shipping copy. | Modify |
| `app/(root)/(footer)/lieferung-&-rücksendung/page.tsx` | Correct shipping copy. | Modify |
| `app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx` | Correct shipping copy; pass `stockQuantity` to the cart. | Modify |
| `app/(root)/bekleidung/[brand]/[slug]/components/ProductCard.tsx` | `price: string \| null`. | Modify |
| `app/(root)/bekleidung/[brand]/[slug]/page.tsx` | Prefer backend `completeTheLookProducts`. | Modify |
| `app/(root)/orders/[orderNumber]/confirmation/ConfirmationClient.tsx` | Hide the upsell on a 404. | Modify |
| `app/(root)/account/components/Bestellungen.tsx` | PENDING copy; per-brand shipments. | Modify |
| `app/(root)/account/components/Einstellungen.tsx` | Account erasure flow. | Modify |
| `app/(dashboard)/dashboard/vendor/_components/Products.tsx` | Verbatim 409 + Archive action. | Modify |
| `lib/api/modules/brandApi.ts` | `status` on `UpdateProductDto`. | Modify |

---

### Task 1: Status-keyed German error copy

The backend now guarantees a `message` on every error, but it is English. Map by status for the infra-layer statuses; keep the backend string verbatim where it is domain-specific and actionable (400 enum hints, most 409s), and always keep the raw string for logs.

**Files:**
- Create: `lib/api/errorCopy.ts`
- Create: `lib/api/errorCopy.test.ts`
- Modify: `lib/api/fetcher.ts`
- Test: `lib/api/errorCopy.test.ts`, `lib/api/fetcher.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `germanErrorMessage(status: number, serverMessage?: string | null): string`; `FetchError` gains a readonly `serverMessage?: string` field carrying the untranslated backend string.

- [ ] **Step 1: Write the failing test**

Create `lib/api/errorCopy.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { germanErrorMessage } from './errorCopy'

describe('germanErrorMessage', () => {
  it('translates infra statuses instead of echoing the English backend string', () => {
    expect(germanErrorMessage(401, 'Authentication required')).toMatch(/Sitzung/)
    expect(germanErrorMessage(403, 'Access denied')).toMatch(/Berechtigung/)
    expect(germanErrorMessage(415, 'Content type not supported')).toMatch(/Format/)
    expect(germanErrorMessage(406, 'Not acceptable')).toMatch(/nicht unterstützt/)
    expect(germanErrorMessage(405, 'Method not allowed')).toMatch(/nicht möglich/)
  })

  it('translates the concurrent-edit 409 but keeps a domain 409 verbatim', () => {
    expect(germanErrorMessage(409, 'The record was modified concurrently — please reload and retry'))
      .toMatch(/neu laden/)
    expect(germanErrorMessage(409, 'Product 41 still has listings. Remove them first.'))
      .toBe('Product 41 still has listings. Remove them first.')
  })

  it('keeps a 400 enum hint verbatim — it names the accepted values', () => {
    const msg = "Invalid value 'NOT_A_STATUS' for 'status'. Allowed values: [PENDING, PAID]"
    expect(germanErrorMessage(400, msg)).toBe(msg)
  })

  it('gives 5xx a single German message', () => {
    expect(germanErrorMessage(500, 'An unexpected error occurred')).toMatch(/Serverfehler/)
    expect(germanErrorMessage(503, null)).toMatch(/Serverfehler/)
  })

  it('falls back to generic German when the body carried no message', () => {
    expect(germanErrorMessage(418, undefined)).toBe('Ein Fehler ist aufgetreten.')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run lib/api/errorCopy.test.ts`
Expected: FAIL with `Failed to resolve import "./errorCopy"`.

- [ ] **Step 3: Write the implementation**

Create `lib/api/errorCopy.ts`:

```ts
// The backend now returns a guaranteed, non-null `message` on every error path — but always in
// English ("Authentication required", "Access denied", …). The UI is German, so infra-layer
// statuses get our own copy keyed on the status code. Domain-specific messages (a 400 that lists
// the accepted enum values, a 409 that names the product and tells the brand to archive it)
// carry information we cannot reconstruct from a status alone, so those pass through verbatim.
// The untranslated string is always preserved on FetchError.serverMessage for logs.

const GENERIC = 'Ein Fehler ist aufgetreten.';

// Infra-layer statuses: the backend message is boilerplate, so ours is strictly better.
const BY_STATUS: Record<number, string> = {
  401: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.',
  403: 'Dafür fehlt dir die Berechtigung.',
  405: 'Diese Aktion ist hier nicht möglich.',
  406: 'Dieses Antwortformat wird nicht unterstützt.',
  415: 'Das Format der Anfrage wird nicht unterstützt.',
};

const CONCURRENT_EDIT =
  'Der Eintrag wurde zwischenzeitlich geändert. Bitte lade die Seite neu und versuche es erneut.';

export function germanErrorMessage(status: number, serverMessage?: string | null): string {
  const fixed = BY_STATUS[status];
  if (fixed) return fixed;

  // 409 covers two very different things: an optimistic-locking clash (boilerplate English,
  // worth translating) and a domain refusal that names the record and the way out (keep it).
  if (status === 409) {
    if (serverMessage && /modified concurrently/i.test(serverMessage)) return CONCURRENT_EDIT;
    return serverMessage || CONCURRENT_EDIT;
  }

  if (status >= 500) return 'Serverfehler. Bitte versuche es später erneut.';

  return serverMessage || GENERIC;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run lib/api/errorCopy.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Wire it into the fetcher**

In `lib/api/fetcher.ts`, add as the first line of the file:

```ts
import { germanErrorMessage } from './errorCopy';
```

Replace the `FetchError` class with:

```ts
export class FetchError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** The untranslated backend string. English — for logs and debugging, never for the UI. */
    public readonly serverMessage?: string,
  ) {
    super(message);
    this.name = 'FetchError';
  }
}
```

Replace the 401 throw:

```ts
    throw new FetchError(401, germanErrorMessage(401), 'Unauthorized');
```

Replace the whole `if (!res.ok) { … }` block with:

```ts
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // Every backend error path now returns {timestamp, status, error, message, path} with a
    // guaranteed message. A non-JSON body means something upstream of the app answered
    // (proxy, gateway) — keep the raw text as the log string only.
    let serverMessage: string | undefined;
    try {
      const json = JSON.parse(text);
      serverMessage = json.message || json.error || undefined;
    } catch { serverMessage = text || undefined; }
    throw new FetchError(res.status, germanErrorMessage(res.status, serverMessage), serverMessage);
  }
```

- [ ] **Step 6: Add fetcher tests for the envelope**

Append to `lib/api/fetcher.test.ts` (extend the existing top-of-file import to `import { getBaseUrl, fetcher, FetchError } from './fetcher'` and add `beforeEach` to the vitest import):

```ts
describe('fetcher error envelope', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test')
  })

  it('translates a 403 and keeps the English string for logs', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ timestamp: 't', status: 403, error: 'Forbidden', message: 'Access denied', path: '/admin/orders' }),
      { status: 403 },
    )))
    const err = await fetcher('/admin/orders', { auth: false }).catch((e) => e)
    expect(err).toBeInstanceOf(FetchError)
    expect(err.status).toBe(403)
    expect(err.message).toMatch(/Berechtigung/)
    expect(err.serverMessage).toBe('Access denied')
  })

  it('passes a domain 409 through verbatim', async () => {
    const msg = 'Product 41 still has listings. Remove them first.'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ status: 409, error: 'Conflict', message: msg, path: '/products/delete/41' }),
      { status: 409 },
    )))
    const err = await fetcher('/products/delete/41', { auth: false }).catch((e) => e)
    expect(err.message).toBe(msg)
  })
})
```

Add `vi.unstubAllGlobals()` to the existing `afterEach` in that file.

- [ ] **Step 7: Run the suite**

Run: `pnpm exec vitest run lib/api/`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/api/errorCopy.ts lib/api/errorCopy.test.ts lib/api/fetcher.ts lib/api/fetcher.test.ts
git commit -m "feat(api): map backend error copy to German by status code"
```

---

### Task 2: No false logout on token-less requests

The backend now answers an unauthenticated request with 401 instead of 403, which routes it into `onUnauthorized` → `clearToken()`. A request fired before the token is read from storage (or by a component that never had one) would now wipe local auth state. Only fire the session-expired path when a token was actually sent.

**Files:**
- Modify: `lib/api/fetcher.ts`
- Test: `lib/api/fetcher.test.ts`

**Interfaces:**
- Consumes: `FetchError`, `germanErrorMessage` from Task 1.
- Produces: no signature change. `setOnUnauthorized(cb)` is now only invoked for a 401 on a request that carried an `Authorization` header.

- [ ] **Step 1: Write the failing test**

Append to `lib/api/fetcher.test.ts` (add `setOnUnauthorized` to the top-of-file import from `./fetcher`):

```ts
describe('401 handling', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test')
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ status: 401, error: 'Unauthorized', message: 'Authentication required', path: '/users/me' }),
      { status: 401 },
    )))
  })

  it('does NOT clear auth state when no token was sent', async () => {
    const onUnauth = vi.fn()
    setOnUnauthorized(onUnauth)
    await fetcher('/users/me').catch(() => {})
    expect(onUnauth).not.toHaveBeenCalled()
  })

  it('clears auth state when a token was sent and rejected', async () => {
    localStorage.setItem('enunas_token', 'stale-jwt')
    const onUnauth = vi.fn()
    setOnUnauthorized(onUnauth)
    await fetcher('/users/me').catch(() => {})
    expect(onUnauth).toHaveBeenCalledTimes(1)
  })

  it('does NOT clear auth state for an explicitly anonymous request', async () => {
    localStorage.setItem('enunas_token', 'valid-jwt')
    const onUnauth = vi.fn()
    setOnUnauthorized(onUnauth)
    await fetcher('/products/1', { auth: false }).catch(() => {})
    expect(onUnauth).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run lib/api/fetcher.test.ts`
Expected: FAIL — the first case reports `onUnauth` called 1 time, expected 0.

- [ ] **Step 3: Write the implementation**

In `lib/api/fetcher.ts`, replace the auth-header block and the 401 branch with:

```ts
  // Whether this request actually carried a token. The backend now answers an unauthenticated
  // request with 401 (it used to be 403), so a token-less call — anything fired before
  // AuthContext has read localStorage, or by a component that was never logged in — would
  // otherwise trip the session-expired path and clear auth state for no reason.
  let sentToken = false;
  if (auth && typeof window !== 'undefined') {
    const token = localStorage.getItem('enunas_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      sentToken = true;
    }
  }

  const res = await fetch(`${getBaseUrl()}${path}`, { ...rest, headers });

  if (res.status === 401) {
    // 401 = "who are you", 403 = "you may not". Only a rejected token means the session died.
    if (sentToken) onUnauthorized?.();
    throw new FetchError(401, germanErrorMessage(401), 'Unauthorized');
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run lib/api/fetcher.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify the build**

Run: `pnpm run build`
Expected: build succeeds, no type errors.

- [ ] **Step 6: Commit**

```bash
git add lib/api/fetcher.ts lib/api/fetcher.test.ts
git commit -m "fix(api): only clear session on 401 when a token was actually sent"
```

---

### Task 3: Listing endpoints — paging, region, and the auth comment

`GET /listings` became a `Page` and now honours an omitted `region` as "any region". `GET /listings/{id}` 404s for gated listings. `GET /products/{id}/listings` keeps its `List` shape but returns `[]` for a hidden product. The summary handoff claimed the per-product route was paged too; write the client to tolerate either shape so the contradiction cannot break the PDP.

**Files:**
- Create: `lib/api/modules/listingApi.ts`
- Create: `lib/api/modules/listingApi.test.ts`
- Modify: `lib/api/modules/productApi.ts:103-106`
- Modify: `lib/api/modules/productApi.test.ts`
- Modify: `lib/api/index.ts`
- Test: `lib/api/modules/listingApi.test.ts`, `lib/api/modules/productApi.test.ts`

**Interfaces:**
- Consumes: `fetcher` (Tasks 1–2); `ApiListing`, `ApiPage` from `@/types/api`.
- Produces:
  - `export interface ListingSearchParams { region?: string; page?: number; size?: number }`
  - `listingApi.list(params?: ListingSearchParams): Promise<ApiPage<ApiListing>>`
  - `listingApi.getById(listingId: string | number): Promise<ApiListing>`
  - `productApi.getListings(productId: string): Promise<ApiListing[]>` — unchanged signature, now shape-tolerant.

- [ ] **Step 1: Write the failing test**

Create `lib/api/modules/listingApi.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { listingApi } from './listingApi'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 }

beforeEach(() => { vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test') })
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

describe('listingApi.list', () => {
  it('omits region entirely when not given — a missing filter means "any region"', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(emptyPage))
    vi.stubGlobal('fetch', spy)
    await listingApi.list()
    expect(spy.mock.calls[0][0]).toBe('https://api.test/listings')
  })

  it('sends region, page and size when given', async () => {
    const spy = vi.fn().mockResolvedValue(jsonResponse(emptyPage))
    vi.stubGlobal('fetch', spy)
    await listingApi.list({ region: 'DE', page: 1, size: 50 })
    expect(spy.mock.calls[0][0]).toBe('https://api.test/listings?region=DE&page=1&size=50')
  })

  it('normalises a legacy bare-array response into a page', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([{ id: '1', price: 10, createdAt: 'x' }])))
    const page = await listingApi.list()
    expect(page.content).toHaveLength(1)
    expect(page.totalElements).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run lib/api/modules/listingApi.test.ts`
Expected: FAIL with `Failed to resolve import "./listingApi"`.

- [ ] **Step 3: Write the implementation**

Create `lib/api/modules/listingApi.ts`:

```ts
import { fetcher } from '../fetcher';
import type { ApiListing, ApiPage } from '@/types/api';

// GET /listings is public: the backend applies the storefront browse gate (product ACTIVE and a
// currently-sellable listing) for anonymous callers, and exempts the owning brand and admins.
// The token is attached when present, so the same call serves both audiences.
export interface ListingSearchParams {
  /** Omit for "any region". Passing DE returns DE listings plus globally-sold ones. */
  region?: string;
  page?: number;
  size?: number;
}

function toPage(raw: ApiPage<ApiListing> | ApiListing[]): ApiPage<ApiListing> {
  // GET /listings became a Page in this round. Tolerate the old bare array so a mismatched
  // backend deploy degrades instead of crashing the caller.
  if (Array.isArray(raw)) {
    return { content: raw, totalElements: raw.length, totalPages: 1, number: 0, size: raw.length };
  }
  return raw;
}

export const listingApi = {
  async list(params: ListingSearchParams = {}): Promise<ApiPage<ApiListing>> {
    const qs = new URLSearchParams();
    // A missing region used to compile to `region = NULL` and match nothing. It now means
    // "any region" — so never send an empty value just to fill the slot.
    if (params.region) qs.set('region', params.region);
    if (params.page !== undefined) qs.set('page', String(params.page));
    if (params.size !== undefined) qs.set('size', String(params.size));
    const query = qs.toString() ? `?${qs}` : '';
    return toPage(await fetcher<ApiPage<ApiListing> | ApiListing[]>(`/listings${query}`));
  },

  // Throws FetchError(404) when the product is suspended/rejected or the listing's availability
  // window is closed — the lookup is gated now, it is no longer an ungated fetch by id.
  async getById(listingId: string | number): Promise<ApiListing> {
    return fetcher<ApiListing>(`/listings/${listingId}`);
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run lib/api/modules/listingApi.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Make `productApi.getListings` shape-tolerant and fix its comment**

In `lib/api/modules/productApi.ts`, replace the `getListings` method — including the comment above it that currently reads "Requires CUSTOMER or BRAND_PARTNER auth — token must be available." — with:

```ts
  // Public: GET /products/** is permitAll. Anonymous callers get the browse-gated view, which
  // is an empty list for a hidden product (deliberately not a 404 — the PDP keeps rendering an
  // unavailable product and shows "Preis nicht verfügbar"). The owning brand and admins get the
  // full management view; the token is attached automatically when one exists.
  // The route returns a List; a Page is tolerated so a backend shape change cannot break the PDP.
  async getListings(productId: string): Promise<ApiListing[]> {
    const raw = await fetcher<ApiListing[] | { content: ApiListing[] }>(`/products/${productId}/listings`);
    return Array.isArray(raw) ? raw : raw.content ?? [];
  },
```

- [ ] **Step 6: Add the shape-tolerance test**

Append to `lib/api/modules/productApi.test.ts`, ensuring `productApi` and `describe, it, expect, vi` are imported at the top of that file:

```ts
describe('productApi.getListings', () => {
  beforeEach(() => { vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test') })
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

  it('returns the array as-is', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ id: '1', price: 10, createdAt: 'x' }]), { status: 200 }),
    ))
    await expect(productApi.getListings('7')).resolves.toHaveLength(1)
  })

  it('unwraps a paged response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ content: [{ id: '1', price: 10, createdAt: 'x' }] }), { status: 200 }),
    ))
    await expect(productApi.getListings('7')).resolves.toHaveLength(1)
  })

  it('returns an empty list for a hidden product', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([]), { status: 200 })))
    await expect(productApi.getListings('7')).resolves.toEqual([])
  })
})
```

- [ ] **Step 7: Export the new module**

In `lib/api/index.ts`, after the `productApi` export lines, add:

```ts
export { listingApi } from './modules/listingApi';
export type { ListingSearchParams } from './modules/listingApi';
```

- [ ] **Step 8: Run tests and build**

Run: `pnpm exec vitest run lib/api/ && pnpm run build`
Expected: PASS, build succeeds.

- [ ] **Step 9: Commit**

```bash
git add lib/api/modules/listingApi.ts lib/api/modules/listingApi.test.ts lib/api/modules/productApi.ts lib/api/modules/productApi.test.ts lib/api/index.ts
git commit -m "feat(api): paged region-aware listingApi; tolerate list-or-page product listings"
```

---

### Task 4: Hide the confirmation upsell when its listing is gone

`UPSELL_CONFIG.listingId` is hardcoded. `GET /listings/{id}` now 404s when the product is suspended/rejected or the availability window is closed. The current `.catch(() => {})` swallows that and still renders the block using `fallbackOriginalPrice` — merchandising something that cannot be bought.

**Files:**
- Modify: `app/(root)/orders/[orderNumber]/confirmation/ConfirmationClient.tsx:8, 272, 288-294, 316, 442`

**Interfaces:**
- Consumes: `listingApi.getById` (Task 3), `FetchError` (Task 1).
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Swap the raw fetcher call for `listingApi`**

Replace the import line:

```ts
import { orderApi, fetcher } from '@/lib/api'
```

with:

```ts
import { orderApi, listingApi, FetchError } from '@/lib/api'
```

- [ ] **Step 2: Add the unavailability state**

Immediately after `const [showUpsell, setShowUpsell] = useState(isUpsell)`, add:

```ts
  // The upsell listing is hardcoded. GET /listings/{id} is gated now: it 404s once the product
  // is suspended/rejected or the availability window closes. Merchandising an unbuyable item on
  // the confirmation page is worse than showing nothing, so a 404 hides the block entirely.
  const [upsellUnavailable, setUpsellUnavailable] = useState(false)
```

- [ ] **Step 3: Replace the listing fetch effect**

Replace:

```ts
  useEffect(() => {
    if (!showUpsell) return
    fetcher<ApiListing>(`/listings/${UPSELL_CONFIG.listingId}`)
      .then(setListing)
      .catch(() => {})
  }, [showUpsell])
```

with:

```ts
  useEffect(() => {
    if (!showUpsell && !isUpsell) return
    listingApi
      .getById(UPSELL_CONFIG.listingId)
      .then((l) => { setListing(l); setUpsellUnavailable(false) })
      .catch((err) => {
        // 404 = gated or gone → hide the offer. Anything else (network, 5xx) is transient, so
        // keep the block and let the fallback price stand.
        if (err instanceof FetchError && err.status === 404) setUpsellUnavailable(true)
      })
  }, [showUpsell, isUpsell])
```

- [ ] **Step 4: Gate both render branches**

Change `if (isUpsell) {` to:

```ts
  if (isUpsell && !upsellUnavailable) {
```

Change `if (showUpsell) {` to:

```ts
  if (showUpsell && !upsellUnavailable) {
```

Both then fall through to the plain confirmation view, which is the correct degraded state.

- [ ] **Step 5: Verify the build**

Run: `pnpm run build`
Expected: build succeeds. If `ApiListing` became an unused import, remove it from the type-import line.

- [ ] **Step 6: Commit**

```bash
git add "app/(root)/orders/[orderNumber]/confirmation/ConfirmationClient.tsx"
git commit -m "fix(confirmation): hide the upsell when its listing 404s"
```

---

### Task 5: Complete-The-Look items with a null price

`ProductResponseDto` now carries `completeTheLookProducts`, and a referenced product with no active listing has `price: null` (it used to 500). Nothing in the frontend reads the field yet — the PDP builds its "Vervollständige den Look" row from a category query. Map the field through the adapter, prefer it when the backend supplies it, and render a card with no price when the price is null.

**Files:**
- Modify: `types/api.ts` (above `ApiProduct`, and inside it)
- Modify: `lib/api/productResponseAdapter.ts`
- Modify: `lib/api/productResponseAdapter.test.ts`
- Modify: `app/(root)/bekleidung/[brand]/[slug]/components/ProductCard.tsx:4-18`
- Modify: `app/(root)/bekleidung/[brand]/[slug]/page.tsx:81-90, 115-118`
- Test: `lib/api/productResponseAdapter.test.ts`

**Interfaces:**
- Consumes: `adaptProduct`.
- Produces:
  - `ApiCompleteTheLookItem { id: string; name: string; brandName?: string; slug?: string; price: number | null; images: string[] }`
  - `ApiProduct.completeTheLookProducts?: ApiCompleteTheLookItem[]`
  - `RecItem.price: string | null`

- [ ] **Step 1: Write the failing test**

Append to `lib/api/productResponseAdapter.test.ts`:

```ts
describe('completeTheLookProducts', () => {
  const base = {
    id: 41, name: 'Jacket', slug: 'jacket', price: 200, brandName: 'Alpha',
    status: 'ACTIVE', createdAt: '2026-01-01T00:00:00',
  }

  it('carries a null price through instead of coercing it to 0', () => {
    const p = adaptProduct({
      ...base,
      completeTheLookProducts: [
        { id: 88, name: 'Cargo Pant', price: 129 },
        { id: 92, name: 'Wool Beanie', price: null },
      ],
    } as never)
    expect(p.completeTheLookProducts?.map(i => i.price)).toEqual([129, null])
  })

  it('is undefined when the backend omits the field', () => {
    expect(adaptProduct(base as never).completeTheLookProducts).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run lib/api/productResponseAdapter.test.ts`
Expected: FAIL — `completeTheLookProducts` is `undefined` in the first case.

- [ ] **Step 3: Add the types**

In `types/api.ts`, directly above `export interface ApiProduct {`, add:

```ts
// One "Vervollständige den Look" reference. The backend used to 500 when a referenced product
// had no sellable listing; it now returns the card with `price: null`. Null means "not currently
// buyable" — render the card without a price and without any add-to-cart affordance, never as
// €0 or €null.
export interface ApiCompleteTheLookItem {
  id: string;
  name: string;
  brandName?: string;
  slug?: string;
  price: number | null;
  images: string[];
}
```

Inside `ApiProduct`, directly after the `details?: …` line, add:

```ts
  /** Absent when the brand has not curated a look for this product. */
  completeTheLookProducts?: ApiCompleteTheLookItem[];
```

- [ ] **Step 4: Map it in the adapter**

In `lib/api/productResponseAdapter.ts`, change the top import to:

```ts
import type { ApiProduct, ApiCompleteTheLookItem } from '@/types/api';
```

Add to `RawProductResponse`, after `images?: RawImage[];`:

```ts
  // The backend sends a trimmed product shape here; only id/name/price are guaranteed.
  completeTheLookProducts?: {
    id: number;
    name: string;
    price: number | null;
    brandName?: string;
    slug?: string;
    images?: RawImage[];
  }[];
```

In the object returned by `adaptProduct`, after the `details: { … }` line, add:

```ts
    // Deliberately NOT coerced to 0 like `price` above: a look card with no price simply
    // renders without one, so there is nothing to guard with an `available` flag.
    completeTheLookProducts: raw.completeTheLookProducts?.map(
      (c): ApiCompleteTheLookItem => ({
        id: String(c.id),
        name: c.name,
        brandName: c.brandName,
        slug: c.slug,
        price: c.price ?? null,
        images: [...(c.images ?? [])]
          .sort((a, b) => Number(b.primary) - Number(a.primary) || a.displayOrder - b.displayOrder)
          .map(i => i.imageUrl),
      }),
    ),
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run lib/api/productResponseAdapter.test.ts`
Expected: PASS.

- [ ] **Step 6: Let a card render without a price**

In `app/(root)/bekleidung/[brand]/[slug]/components/ProductCard.tsx`, change the `RecItem.price` field to:

```ts
  /** Pre-formatted price, e.g. "€ 1.120". null when the item has no active listing — the card
   *  then renders without a price line. */
  price: string | null;
```

Find the JSX element that renders `{item.price}` and wrap it in a null check, preserving its existing classes verbatim:

```tsx
        {item.price !== null && (
          <p className="/* keep the existing classes from this element */">{item.price}</p>
        )}
```

- [ ] **Step 7: Prefer the backend's curated look on the PDP**

In `app/(root)/bekleidung/[brand]/[slug]/page.tsx`, add `ApiCompleteTheLookItem` to the existing `@/types/api` type import, then add below `toRecItem`:

```ts
function completeTheLookToRecItem(c: ApiCompleteTheLookItem): RecItem {
  return {
    brand: c.brandName ?? '',
    name: c.name,
    // null price = no active listing. The card renders without a price rather than "€ 0".
    price: c.price != null ? `€ ${c.price.toFixed(0)}` : null,
    colors: [],
    href: c.slug && c.brandName ? `/bekleidung/${generateSlug(c.brandName)}/${c.slug}` : '#',
    image: c.images?.[0],
  }
}
```

Replace the `relatedItems` assignment with:

```ts
  // The brand's own curated look wins when the backend supplies one; the category query is only
  // a fallback for products with nothing curated.
  const curated = resolved.completeTheLookProducts ?? []
  const relatedItems: RecItem[] = curated.length > 0
    ? curated.slice(0, 4).map(completeTheLookToRecItem)
    : categoryRes.content
        .filter((p: ApiProduct) => p.id !== resolved.id)
        .slice(0, 4)
        .map(toRecItem)
```

- [ ] **Step 8: Fix `toRecItem` for the same nullability**

In the same file, change `toRecItem`'s price line so an unavailable product in the fallback list is handled identically:

```ts
    price: p.available ? `€ ${p.price.toFixed(0)}` : null,
```

- [ ] **Step 9: Run tests and build**

Run: `pnpm exec vitest run && pnpm run build`
Expected: PASS. Fix any other `RecItem` construction site the compiler flags — each must supply `string | null`.

- [ ] **Step 10: Commit**

```bash
git add types/api.ts lib/api/productResponseAdapter.ts lib/api/productResponseAdapter.test.ts "app/(root)/bekleidung/[brand]/[slug]/components/ProductCard.tsx" "app/(root)/bekleidung/[brand]/[slug]/page.tsx"
git commit -m "feat(pdp): render curated Complete-The-Look cards, price optional"
```

---

### Task 6: PENDING orders read as awaiting-or-abandoned

A failed checkout now commits the order before calling the payment provider, so `GET /orders/me` can return a PENDING order the customer never got a checkout URL for. It auto-cancels within 30 minutes. Never offer "resume payment" on it.

**Files:**
- Modify: `app/(root)/account/components/Bestellungen.tsx:30, ~136`

**Interfaces:**
- Consumes: `ApiOrder` (unchanged).
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Retitle the PENDING status**

In `STATUS_META`, change the PENDING row to:

```ts
  PENDING:          { label: 'Zahlung ausstehend',  toneClass: 'text-enunas-warning' },
```

- [ ] **Step 2: Add the explanatory note in the expanded detail**

Inside the `{open && (` block, as the first child of `<div className="border-t border-enunas-off-white px-5 md:px-6 py-5 bg-[#FAFAF8]">` and before the items list, add:

```tsx
          {/* A failed payment initiation now leaves a real PENDING order behind — the backend
              commits the order before calling the payment provider so a payment can never exist
              without one. There is no checkout URL to resume; an expiry job cancels it within
              30 minutes and emails the customer. Say so rather than offering a dead action. */}
          {order.status === 'PENDING' && (
            <p className="mb-4 pb-3 border-b border-enunas-gray-light font-league-spartan text-xs text-enunas-gray-medium leading-relaxed">
              Diese Bestellung wartet noch auf den Zahlungsabschluss. Falls die Zahlung nicht
              zustande kommt, wird sie innerhalb von 30 Minuten automatisch storniert — du musst
              nichts weiter tun.
            </p>
          )}
```

- [ ] **Step 3: Verify no resume-payment affordance exists**

Run: `grep -n "checkoutUrl" "app/(root)/account/components/Bestellungen.tsx"`
Expected: no output. If a match appears, remove that affordance for PENDING orders.

- [ ] **Step 4: Verify the build**

Run: `pnpm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add "app/(root)/account/components/Bestellungen.tsx"
git commit -m "feat(account): explain PENDING orders instead of offering a dead resume"
```

---

### Task 7: Per-brand shipments in the order detail

An order carries one shipment row per brand. When an admin marks a whole order shipped, brands that had not shipped get `status: SHIPPED` with `shippedAt` set and `carrier`/`trackingNumber` null — and the customer now receives a dispatch email for it, so they will go looking for tracking that does not exist. A V29 constraint guarantees `shippedAt` is present whenever status is SHIPPED.

**Files:**
- Modify: `types/api.ts` (above `// Mirrors backend OrderResponseDto.`, and inside `ApiOrder`)
- Create: `lib/orderShipments.ts`
- Create: `lib/orderShipments.test.ts`
- Modify: `app/(root)/account/components/Bestellungen.tsx`
- Test: `lib/orderShipments.test.ts`

**Interfaces:**
- Consumes: `ApiOrder`.
- Produces:
  - `type OrderShipmentStatus = 'AWAITING_SHIPMENT' | 'SHIPPED' | 'PROBLEM'`
  - `interface ApiOrderShipment { brandId: number | string; brandName: string; status: OrderShipmentStatus | string; shippedAt?: string; carrier?: string | null; trackingNumber?: string | null }`
  - `ApiOrder.shipments?: ApiOrderShipment[]`
  - `describeShipment(s: ApiOrderShipment): { label: string; trackingNumber: string | null }`

- [ ] **Step 1: Write the failing test**

Create `lib/orderShipments.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { describeShipment } from './orderShipments'

describe('describeShipment', () => {
  it('names the carrier and returns the tracking number when both are present', () => {
    expect(describeShipment({
      brandId: 1, brandName: 'Alpha', status: 'SHIPPED',
      shippedAt: '2026-08-31T17:04:12', carrier: 'DHL', trackingNumber: '00340',
    })).toEqual({ label: 'Versandt — DHL', trackingNumber: '00340' })
  })

  it('says no tracking is available for an admin-marked shipment', () => {
    expect(describeShipment({
      brandId: 1, brandName: 'Alpha', status: 'SHIPPED',
      shippedAt: '2026-08-31T17:04:12', carrier: null, trackingNumber: null,
    })).toEqual({ label: 'Versandt — keine Sendungsnummer verfügbar', trackingNumber: null })
  })

  it('labels the pre-shipment and problem states', () => {
    expect(describeShipment({ brandId: 1, brandName: 'A', status: 'AWAITING_SHIPMENT' }).label)
      .toBe('Versand ausstehend')
    expect(describeShipment({ brandId: 1, brandName: 'A', status: 'PROBLEM' }).label)
      .toBe('Versandproblem')
  })

  it('falls back to the raw status for an unknown value', () => {
    expect(describeShipment({ brandId: 1, brandName: 'A', status: 'WAT' }).label).toBe('WAT')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run lib/orderShipments.test.ts`
Expected: FAIL with `Failed to resolve import "./orderShipments"`.

- [ ] **Step 3: Add the types**

In `types/api.ts`, directly above `// Mirrors backend OrderResponseDto.`, add:

```ts
// One brand's fulfilment state on an order. A multi-brand order gets one row per brand, each
// shipping independently.
export type OrderShipmentStatus = 'AWAITING_SHIPMENT' | 'SHIPPED' | 'PROBLEM';

// carrier/trackingNumber are null when an admin marked the whole order shipped rather than the
// brand confirming its own dispatch. shippedAt is guaranteed non-null whenever status is
// SHIPPED — a database constraint (migration V29) enforces it, so never guard that pairing.
export interface ApiOrderShipment {
  brandId: number | string;
  brandName: string;
  status: OrderShipmentStatus | string;
  shippedAt?: string;
  carrier?: string | null;
  trackingNumber?: string | null;
}
```

Inside `ApiOrder`, directly after the `shippingSnapshots?: ShippingSnapshot[];` line, add:

```ts
  // One row per brand on the order. Absent on orders that predate per-brand fulfilment.
  shipments?: ApiOrderShipment[];
```

- [ ] **Step 4: Write the helper**

Create `lib/orderShipments.ts`:

```ts
import type { ApiOrderShipment } from '@/types/api'

// An admin marking a whole order shipped produces a SHIPPED row with no carrier and no tracking
// number — and the customer gets a dispatch email for it. The email says tracking is unavailable,
// so the order detail must say the same rather than showing an empty carrier or a dead link.
export function describeShipment(s: ApiOrderShipment): { label: string; trackingNumber: string | null } {
  const tracking = s.trackingNumber || null

  if (s.status === 'SHIPPED') {
    if (s.carrier && tracking) return { label: `Versandt — ${s.carrier}`, trackingNumber: tracking }
    return { label: 'Versandt — keine Sendungsnummer verfügbar', trackingNumber: null }
  }
  if (s.status === 'AWAITING_SHIPMENT') return { label: 'Versand ausstehend', trackingNumber: null }
  if (s.status === 'PROBLEM') return { label: 'Versandproblem', trackingNumber: null }

  return { label: String(s.status), trackingNumber: tracking }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run lib/orderShipments.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 6: Render the shipments block**

In `app/(root)/account/components/Bestellungen.tsx`, add the import:

```ts
import { describeShipment } from '@/lib/orderShipments'
```

Immediately after the shipping-breakdown block (the `) : null}` that closes it) and before the `{/* Actions */}` comment, add:

```tsx
          {/* Per-brand fulfilment. Each brand ships independently, so an order can be part-shipped. */}
          {order.shipments && order.shipments.length > 0 && (
            <div className="mb-4 pt-3 border-t border-enunas-gray-light space-y-2">
              <p className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium">
                Sendungen
              </p>
              {order.shipments.map((s) => {
                const { label, trackingNumber } = describeShipment(s)
                return (
                  <div key={String(s.brandId)} className="flex items-baseline justify-between gap-4">
                    <p className="font-league-spartan text-xs text-enunas-black">{s.brandName}</p>
                    <div className="text-right">
                      <p className="font-league-spartan text-xs text-enunas-gray-medium">{label}</p>
                      {trackingNumber && (
                        <Link
                          href={`/sendungsverfolgung?tracking=${trackingNumber}`}
                          className="font-league-spartan text-[11px] tracking-[0.15em] uppercase text-enunas-black underline underline-offset-4 hover:text-enunas-purple transition-colors duration-300"
                        >
                          Sendung verfolgen →
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
```

- [ ] **Step 7: Suppress the duplicate order-level tracking link**

In the Actions block, change the order-level tracking link condition so it only renders when no per-brand rows carry it:

```tsx
            {order.trackingNumber && !(order.shipments && order.shipments.length > 0) && (
```

Leave the rest of that link untouched.

- [ ] **Step 8: Run tests and build**

Run: `pnpm exec vitest run && pnpm run build`
Expected: PASS, build succeeds.

- [ ] **Step 9: Commit**

```bash
git add types/api.ts lib/orderShipments.ts lib/orderShipments.test.ts "app/(root)/account/components/Bestellungen.tsx"
git commit -m "feat(account): show per-brand shipments, including ones with no tracking"
```

---

### Task 8: DSGVO account erasure

`DELETE /customer/me` is new and irreversible: profile, saved addresses and OAuth links are erased and the login identity is replaced with a tombstone. It refuses with 409 (German, customer-facing message) while an order is still in flight. Order history is retained ten years under §257 HGB — say so before the customer confirms. The existing "Konto löschen" button in `Einstellungen.tsx` has no handler.

**Files:**
- Modify: `lib/api/modules/customerApi.ts`
- Modify: `app/(root)/account/components/Einstellungen.tsx:1-6, 44-75, 145-155`

**Interfaces:**
- Consumes: `fetcher`, `FetchError` (Tasks 1–2); `useAuth().logout`.
- Produces: `customerApi.deleteMe(): Promise<void>`.

- [ ] **Step 1: Add the API method**

In `lib/api/modules/customerApi.ts`, add to the `customerApi` object after `updateProfile`:

```ts
  // DSGVO Art. 17 erasure. Irreversible: profile, saved addresses and OAuth links are erased and
  // the login identity becomes a tombstone. 204 on success — the token is dead immediately, so
  // the caller must clear the session before any further request. 409 while an order is still
  // in flight; that message is customer-facing German and is shown verbatim.
  // Order history itself is retained for ten years (§257 HGB).
  async deleteMe(): Promise<void> {
    return fetcher<void>('/customer/me', { method: 'DELETE' });
  },
```

- [ ] **Step 2: Add the erasure state to the settings component**

In `app/(root)/account/components/Einstellungen.tsx`, add the import:

```ts
import { useRouter } from 'next/navigation'
```

Change the auth destructure to pull `logout`, and add the router:

```ts
  const { user, customer: authCustomer, refreshUser, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()
```

Add, below the existing `saved` state:

```ts
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
```

- [ ] **Step 3: Add the handler**

Below `handleSaveProfile`, add:

```ts
  const DELETE_PHRASE = 'LÖSCHEN'

  async function handleDeleteAccount() {
    if (deleteConfirm.trim().toUpperCase() !== DELETE_PHRASE) return
    setDeleteError(null)
    setDeleting(true)
    try {
      await customerApi.deleteMe()
      // 204: the token is dead server-side from this moment. Clear the local session before
      // anything else can fire an authenticated request against a tombstoned identity.
      logout()
      router.push('/')
    } catch (err) {
      // A 409 message is customer-facing German from the backend — show it as-is.
      setDeleteError(
        err instanceof FetchError ? err.message : 'Konto konnte nicht gelöscht werden. Bitte versuche es erneut.'
      )
      setDeleting(false)
    }
  }
```

- [ ] **Step 4: Replace the danger-zone block**

Replace the whole `{/* Danger zone */}` `<div>` with:

```tsx
      {/* Danger zone — DSGVO Art. 17 erasure. Two steps and a typed phrase: a single click is
          not an adequate gate for an irreversible action. */}
      <div>
        <h2 className="font-cormorant text-2xl font-normal text-enunas-black mb-2">Konto löschen</h2>
        <p className="font-league-spartan text-sm text-enunas-gray-medium leading-relaxed mb-2">
          Das Löschen deines Kontos ist endgültig. Dein Profil, deine gespeicherten Adressen und
          verknüpfte Anmeldedienste werden unwiderruflich gelöscht.
        </p>
        <p className="font-league-spartan text-sm text-enunas-gray-medium leading-relaxed mb-6">
          Deine Bestellhistorie bewahren wir aufgrund der gesetzlichen Aufbewahrungspflicht
          (§ 257 HGB) zehn Jahre auf. Solange noch Bestellungen offen sind, ist die Löschung
          nicht möglich.
        </p>

        {!deleteOpen ? (
          <AccountButton variant="danger" onClick={() => setDeleteOpen(true)}>
            Konto löschen
          </AccountButton>
        ) : (
          <div className="border border-enunas-error/40 p-6 max-w-md">
            <p className="font-league-spartan text-sm text-enunas-black leading-relaxed mb-4">
              Gib <span className="font-semibold tracking-[0.1em]">{DELETE_PHRASE}</span> ein, um
              die endgültige Löschung zu bestätigen.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={DELETE_PHRASE}
              aria-label={`Zum Bestätigen ${DELETE_PHRASE} eingeben`}
              className="w-full border border-enunas-gray-light px-4 py-3 mb-4 font-league-spartan text-sm text-enunas-black bg-white focus:outline-none focus:border-enunas-error transition-colors duration-200 placeholder:text-enunas-gray-medium/50"
            />
            {deleteError && (
              <p className="font-league-spartan text-sm text-enunas-error leading-relaxed mb-4">
                {deleteError}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <AccountButton
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirm.trim().toUpperCase() !== DELETE_PHRASE}
                className="disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? 'Wird gelöscht …' : 'Endgültig löschen'}
              </AccountButton>
              <button
                onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); setDeleteError(null) }}
                className="font-league-spartan text-[11px] tracking-[0.2em] uppercase text-enunas-gray-medium hover:text-enunas-black transition-colors duration-300"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
```

- [ ] **Step 5: Verify the build**

Run: `pnpm run build`
Expected: build succeeds.

- [ ] **Step 6: Verify by hand**

Run `pnpm run dev`, sign in as a customer, open `/account` → Einstellungen. Confirm: the button opens the typed-confirmation step; "Endgültig löschen" stays disabled until `LÖSCHEN` is typed; Abbrechen resets it. Do not complete a real deletion against a live account.

- [ ] **Step 7: Commit**

```bash
git add lib/api/modules/customerApi.ts "app/(root)/account/components/Einstellungen.tsx"
git commit -m "feat(account): DSGVO account erasure with typed confirmation"
```

---

### Task 9: Product-delete 409 shown verbatim, with an Archive way out

`DELETE /products/delete/{id}` now checks up front and returns a 409 that names the product and points at archiving ("… has already been ordered …", "… still has listings …"). The vendor dashboard currently swallows the error entirely (`catch { /* silent */ }`) — the row just does not disappear.

**Files:**
- Modify: `types/api.ts:6` (`ProductStatus`)
- Modify: `lib/api/modules/brandApi.ts:31-33` (`UpdateProductDto`)
- Modify: `app/(dashboard)/dashboard/vendor/_components/Products.tsx:1694-1700, ~1836-1860`

**Interfaces:**
- Consumes: `FetchError` (Task 1); `brandApi.products.delete`, `brandApi.products.update`.
- Produces: `ProductStatus` gains `'ARCHIVED'`; `UpdateProductDto` gains `status?: ProductStatus`.

- [ ] **Step 1: Widen the product status type**

In `types/api.ts`, change `ProductStatus` to:

```ts
export type ProductStatus = 'PENDING' | 'ACTIVE' | 'APPROVED' | 'REJECTED' | 'HIDDEN' | 'ARCHIVED';
```

- [ ] **Step 2: Allow status on the update DTO**

In `lib/api/modules/brandApi.ts`, add `ProductStatus` to the existing `@/types/api` type import and change `UpdateProductDto` to:

```ts
// `status` is not part of CreateProductDto, but PUT /products/update/{id} accepts it — the
// backend's own 409 on delete tells the brand to "set its status to ARCHIVED instead".
export type UpdateProductDto = Partial<
  Omit<CreateProductDto, 'variants' | 'gender' | 'productType' | 'category'>
> & { status?: ProductStatus }
```

- [ ] **Step 3: Surface the error and add the archive action**

In `app/(dashboard)/dashboard/vendor/_components/Products.tsx`, add `FetchError` to the `@/lib/api` import, and add state next to the existing `deleting` / `confirmDelete` state in the same component:

```ts
  const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null)
  const [archiving, setArchiving] = useState<string | null>(null)
```

Replace `deleteProduct` with:

```ts
  async function deleteProduct(id: string) {
    setDeleting(id)
    setDeleteError(null)
    try {
      await brandApi.products.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      setConfirmDelete(null)
    } catch (err) {
      // The backend checks up front now and explains itself: which product, why it is blocked,
      // and that archiving is the way out. That is better copy than anything generic, so it is
      // shown verbatim.
      setDeleteError({
        id,
        message: err instanceof FetchError ? err.message : 'Produkt konnte nicht gelöscht werden.',
      })
    } finally {
      setDeleting(null)
    }
  }

  async function archiveProduct(id: string) {
    setArchiving(id)
    try {
      const updated = await brandApi.products.update(id, { status: 'ARCHIVED' })
      setProducts(prev => prev.map(p => (p.id === id ? updated : p)))
      setDeleteError(null)
      setConfirmDelete(null)
    } catch (err) {
      setDeleteError({
        id,
        message: err instanceof FetchError ? err.message : 'Produkt konnte nicht archiviert werden.',
      })
    } finally {
      setArchiving(null)
    }
  }
```

- [ ] **Step 4: Render the message and the Archive button**

In the row actions, replace the whole `{confirmDelete === p.id ? ( … )` branch content with:

```tsx
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteProduct(p.id)}
                                disabled={deleting === p.id}
                                className="h-7 px-2.5 rounded-none bg-rose-50 border border-rose-200 text-[11px] text-rose-700 hover:bg-rose-100 transition-all duration-150"
                                style={{ fontFamily: 'var(--font-league-spartan)' }}
                              >
                                {deleting === p.id ? '…' : 'Löschen bestätigen'}
                              </button>
                              {deleteError?.id === p.id && (
                                <button
                                  onClick={() => archiveProduct(p.id)}
                                  disabled={archiving === p.id}
                                  className="h-7 px-2.5 rounded-none border border-[#E8E8E8] text-[11px] text-[#6B6B6B] hover:border-[#370E4D]/40 hover:text-[#370E4D] transition-all duration-150"
                                  style={{ fontFamily: 'var(--font-league-spartan)' }}
                                >
                                  {archiving === p.id ? '…' : 'Stattdessen archivieren'}
                                </button>
                              )}
                              <button
                                onClick={() => { setConfirmDelete(null); setDeleteError(null) }}
                                className="h-7 w-7 rounded-none border border-[#E8E8E8] flex items-center justify-center text-[#9B9B9B] hover:text-[#6B6B6B]"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {deleteError?.id === p.id && (
                              <p
                                className="max-w-[420px] text-[11px] leading-snug text-rose-700"
                                style={{ fontFamily: 'var(--font-league-spartan)' }}
                              >
                                {deleteError.message}
                              </p>
                            )}
                          </div>
```

- [ ] **Step 5: Verify the build**

Run: `pnpm run build`
Expected: build succeeds. If the local `AdminApiProduct.status` field is a narrower union, widen it to accept `'ARCHIVED'` rather than casting at the call site.

- [ ] **Step 6: Commit**

```bash
git add types/api.ts lib/api/modules/brandApi.ts "app/(dashboard)/dashboard/vendor/_components/Products.tsx"
git commit -m "feat(vendor): show the delete 409 verbatim and offer archiving"
```

---

### Task 10: Remove the €50 free-shipping logic

The backend has no order-value shipping threshold — shipping is per brand (`GLOBAL_DEFAULT` / `BRAND_FLAT_RATE` / `BRAND_FREE_SHIPPING`), frozen into `shippingSnapshots` at checkout. The frontend promises free shipping over €50 in three components and three copy blocks, and the FAQ separately claims €250. That promise is not honoured by anything and must not ship to production.

**Files:**
- Modify: `lib/pricing.ts`, `lib/pricing.test.ts`
- Modify: `app/(root)/cart/constants.ts:1`
- Modify: `app/(root)/cart/components/CartSummary.tsx:6, 27, ~38`
- Modify: `app/(root)/cart/components/CartSidebar.tsx:7, 453-457`
- Delete: `app/(root)/cart/components/FreeShippingBar.tsx`
- Modify: `app/(root)/cart/page.tsx:8, 37`
- Modify: `app/(root)/(footer)/faqs/page.tsx:57`
- Modify: `app/(root)/(footer)/lieferung-&-rücksendung/page.tsx:53`
- Modify: `app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx:357`
- Test: `lib/pricing.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `lib/pricing.ts` exports `STANDARD_SHIPPING` and `calcShipping(subtotal: number): number` (now subtotal-independent). `FREE_SHIPPING_THRESHOLD` is removed from both `lib/pricing.ts` and `app/(root)/cart/constants.ts`.

- [ ] **Step 1: Write the failing test**

In `lib/pricing.test.ts`, replace the threshold test with (and add `STANDARD_SHIPPING` to the import from `./pricing`, removing any `FREE_SHIPPING_THRESHOLD` import):

```ts
describe('calcShipping', () => {
  it('charges the flat rate regardless of order value — there is no free-shipping threshold', () => {
    expect(calcShipping(10)).toBe(STANDARD_SHIPPING)
    expect(calcShipping(50)).toBe(STANDARD_SHIPPING)
    expect(calcShipping(500)).toBe(STANDARD_SHIPPING)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run lib/pricing.test.ts`
Expected: FAIL — `calcShipping(50)` returns `0`, expected `4.99`.

- [ ] **Step 3: Rewrite the pricing helper**

In `lib/pricing.ts`, delete the `FREE_SHIPPING_THRESHOLD` export and replace `calcShipping` with:

```ts
export const STANDARD_SHIPPING = 4.99

/**
 * Pre-address placeholder only. The backend prices shipping per brand
 * (GLOBAL_DEFAULT / BRAND_FLAT_RATE / BRAND_FREE_SHIPPING) and POST /orders/preview is the
 * authoritative answer the moment an address exists — this is what the summary shows before
 * then. There is deliberately no order-value free-shipping threshold: the backend has no such
 * rule, and promising one the checkout will not honour is worse than a flat estimate.
 */
export function calcShipping(_subtotal: number): number {
  return STANDARD_SHIPPING
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run lib/pricing.test.ts`
Expected: PASS.

- [ ] **Step 5: Strip the threshold from the cart constants**

In `app/(root)/cart/constants.ts`, delete the `FREE_SHIPPING_THRESHOLD` line, leaving `STANDARD_SHIPPING_COST` and `PAYMENT_BADGES`.

- [ ] **Step 6: Fix `CartSummary`**

Change the import to:

```ts
import { STANDARD_SHIPPING_COST, PAYMENT_BADGES } from '../constants'
```

Change the shipping computation to:

```ts
  // Estimate only — the backend prices shipping per brand and confirms it at checkout.
  const shipping = STANDARD_SHIPPING_COST
```

Change the shipping `Row` to drop the "Kostenlos" branch:

```tsx
        <Row label="Versand (geschätzt)" value={formatEuro(shipping)} />
```

- [ ] **Step 7: Fix `CartSidebar`**

Change the import to:

```ts
import { STANDARD_SHIPPING_COST } from '../constants'
```

Replace the free-shipping computation block with:

```ts
  const shipping  = STANDARD_SHIPPING_COST
  const total     = totalPrice + shipping
```

Then remove the progress markup: run `grep -n "freeShip\|remaining\|pct" "app/(root)/cart/components/CartSidebar.tsx"` and delete every JSX block and CSS rule those three identifiers feed — the progress bar, its label, and any "Noch € X bis zum kostenlosen Versand" copy. Leave the rest of the drawer untouched.

- [ ] **Step 8: Delete the dead component and its commented usage**

```bash
git rm "app/(root)/cart/components/FreeShippingBar.tsx"
```

In `app/(root)/cart/page.tsx`, delete line 8 (`// import FreeShippingBar …`) and line 37 (`{/* <FreeShippingBar subtotal={totalPrice} /> */}`).

- [ ] **Step 9: Correct the customer-facing copy**

In `app/(root)/(footer)/faqs/page.tsx:57`, replace the answer string with:

```
'Die Versandkosten werden pro Marke berechnet und dir vor dem Bezahlen in der Bestellübersicht einzeln ausgewiesen. Einige Marken versenden kostenfrei.'
```

In `app/(root)/(footer)/lieferung-&-rücksendung/page.tsx:53`, replace the free-shipping sentence with:

```
Die Versandkosten werden pro Marke berechnet. Enthält deine Bestellung Artikel mehrerer Marken, wird der Versand je Marke separat ausgewiesen — die genaue Aufstellung siehst du vor dem Bezahlen.
```

In `app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx:357`, drop the trailing `Versandkostenfrei ab 50 €.` so the line reads:

```tsx
                  Versand aus {product.originCountry || 'DE'}. {product.returnPeriodDays ?? 14} Tage Rückgaberecht ab Erhalt der Ware.
```

- [ ] **Step 10: Confirm nothing references the threshold**

Run: `grep -rn "FREE_SHIPPING_THRESHOLD\|FreeShippingBar\|ab 50 €\|kostenlosen Versand" --include=*.ts --include=*.tsx app lib`
Expected: no output.

- [ ] **Step 11: Run tests and build**

Run: `pnpm exec vitest run && pnpm run build`
Expected: PASS, build succeeds.

- [ ] **Step 12: Commit**

```bash
git add -A lib/pricing.ts lib/pricing.test.ts "app/(root)/cart" "app/(root)/(footer)/faqs/page.tsx" "app/(root)/(footer)/lieferung-&-rücksendung/page.tsx" "app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx"
git commit -m "fix(shipping): remove the unbacked 50 EUR free-shipping promise"
```

---

### Task 11: Out-of-stock variants cannot reach the cart

The cart lives in `localStorage`, so a variant that has since sold out — or one added from a path that never checked — sits there and goes to checkout. The PDP already disables sold-out sizes; the gate belongs in the cart reducer so every entry point inherits it. Lowest priority of the plan; do it last.

**Files:**
- Modify: `app/context/CartContext.tsx:6-23`
- Modify: `lib/cart-logic.ts`
- Modify: `lib/cart-logic.test.ts`
- Modify: `app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx`
- Test: `lib/cart-logic.test.ts`

**Interfaces:**
- Consumes: `CartItem` from `app/context/CartContext.tsx`.
- Produces: `CartItem.stockQuantity?: number`; `addItem` refuses a zero-stock item and clamps a bump at stock; `updateQty` clamps at stock.

- [ ] **Step 1: Write the failing test**

Append to `lib/cart-logic.test.ts` (the file already has a `newItem` factory taking overrides):

```ts
describe('stock limits', () => {
  it('refuses to add an item with zero stock', () => {
    expect(addItem([], newItem({ stockQuantity: 0 }), () => 'X')).toEqual([])
  })

  it('does not bump an existing line past available stock', () => {
    const one = addItem([], newItem({ stockQuantity: 1 }), () => 'X')
    const two = addItem(one, newItem({ stockQuantity: 1 }), () => 'Y')
    expect(two).toHaveLength(1)
    expect(two[0].quantity).toBe(1)
  })

  it('adds normally when stock is unknown', () => {
    expect(addItem([], newItem(), () => 'X')).toHaveLength(1)
  })

  it('clamps updateQty at available stock', () => {
    const one = addItem([], newItem({ stockQuantity: 2 }), () => 'X')
    expect(updateQty(one, one[0].id, 9)[0].quantity).toBe(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run lib/cart-logic.test.ts`
Expected: FAIL — the zero-stock item is added.

- [ ] **Step 3: Add the field to `CartItem`**

In `app/context/CartContext.tsx`, add to the `CartItem` interface after `defaultListingId?: string`:

```ts
  /** Live stock for this exact variant at add time. Undefined means unknown — no clamp applies. */
  stockQuantity?: number
```

- [ ] **Step 4: Enforce the limit in the reducers**

In `lib/cart-logic.ts`, replace `addItem` and `updateQty` with:

```ts
export function addItem(
  items: CartItem[],
  item: Omit<CartItem, 'id' | 'quantity'>,
  idSuffix: () => string = () => String(Date.now()),
): CartItem[] {
  // The cart persists in localStorage and every entry point funnels through here, so the
  // sold-out gate belongs at this level rather than in each caller. Unknown stock (undefined)
  // is not a limit — only a real number constrains the line.
  if (item.stockQuantity === 0) return items

  const existing = items.find(
    i => i.productId === item.productId && i.size === item.size && i.color?.id === item.color?.id,
  )
  if (existing) {
    const limit = item.stockQuantity ?? existing.stockQuantity
    if (limit !== undefined && existing.quantity >= limit) return items
    return items.map(i => (i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i))
  }
  const newItem: CartItem = {
    ...item,
    id: `${cartDedupKey(item)}-${idSuffix()}`,
    quantity: 1,
  }
  return [...items, newItem]
}

/** Set a line's quantity; quantity ≤ 0 removes the line, and stock caps the upper end. */
export function updateQty(items: CartItem[], itemId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return items.filter(i => i.id !== itemId)
  return items.map(i => {
    if (i.id !== itemId) return i
    const capped = i.stockQuantity !== undefined ? Math.min(quantity, i.stockQuantity) : quantity
    return { ...i, quantity: capped }
  })
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run lib/cart-logic.test.ts`
Expected: PASS.

- [ ] **Step 6: Pass real stock from the PDP**

In `app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx`, find the `addToCart({ … })` call and add to the object literal:

```ts
        stockQuantity: selectedVariant?.stockQuantity,
```

`selectedVariant` already exists in that component — it backs `isOutOfStock` at line 84.

- [ ] **Step 7: Run tests and build**

Run: `pnpm exec vitest run && pnpm run build`
Expected: PASS, build succeeds.

- [ ] **Step 8: Commit**

```bash
git add app/context/CartContext.tsx lib/cart-logic.ts lib/cart-logic.test.ts "app/(root)/bekleidung/[brand]/[slug]/components/ProductDetails.tsx"
git commit -m "fix(cart): refuse and clamp out-of-stock quantities in the cart reducer"
```

---

## Verified — no change required

Checked against the handoff and confirmed already correct. Do not touch these.

| Handoff item | Why nothing is needed |
|---|---|
| Wrong-role 403 must not log anyone out | `lib/api/fetcher.ts` only routes 401 into `onUnauthorized`; 403 falls through to the generic error path. Task 2 tightens 401 further. |
| Unpublished products must 404 gracefully | `lib/api/productResolver.ts:16-22` already distinguishes a genuine 404 (→ `notFound()`) from a backend failure (→ rethrow to `error.tsx`). |
| Missing `keyword` on `/products/search` now 400s | The navbar guards empty input; `productApi.search` always sends an encoded keyword. |
| `sellableOnly` client filter | Keep as defence-in-depth per the handoff. With the server gate it simply stops finding anything to remove. |
| `shippedAt` null while `SHIPPED` | No defensive guard for that pairing exists in the codebase, so there is no dead code to delete. Task 7's helper does not add one. |
| `brandApi.listings.list` | The management view is unchanged for a brand-partner token. Task 3 leaves it alone. |
| Admin brand-spending totals reading higher | Display-only; the frontend sums nothing itself. Note the two views measure different things — brand spending is merchandise only, `totalSpent` includes shipping — so never assert they match. |
| List-endpoint performance work | No client-side slow-list workarounds exist to remove. |
| `WWW-Authenticate: Bearer` on 401 | Response header only; nothing to read. |

## Open questions for the backend

Raise these; none blocks a task above.

1. **Erasure path.** The detailed handoff says `DELETE /customer/me`; the summary table says `DELETE /account`. Task 8 implements `/customer/me`. Confirm before shipping.
2. **`/products/{id}/listings` shape.** The detailed handoff says it stays a `List`; the summary says it is now paged with `region`. Task 3 tolerates both — confirm which is real.
3. **`ARCHIVED` on `PUT /products/update/{id}`.** The 409 message tells brands to archive, but `status` is not documented on `UpdateProductDto`. Task 9 sends it; confirm the backend accepts it.
4. **Suspended brands.** Still undecided backend-side whether a suspended brand's products should disappear from browse. If that lands, product pages start 404-ing — the resolver already handles it, but it is a silent content change worth a heads-up.
5. **Uncapped `?size=`.** The public browse endpoints currently accept up to 2000. The frontend keeps page sizes in the normal grid range, so a future cap near 100 is safe — confirm when it lands.
