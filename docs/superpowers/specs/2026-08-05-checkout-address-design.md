# Checkout Address Experience — Design Spec

**Date:** 2026-08-05
**Status:** Approved
**Scope:** `app/(root)/checkout/` only. `app/(root)/account/components/Adressen.tsx` is a separate, still-mocked surface — explicitly out of scope for this change (noted as a natural follow-up, not touched).

## 1. Problem

The current checkout (`app/(root)/checkout/page.tsx`) has an inline, non-persisted address form and a login-only accordion. It needs to become a real address experience backed by the customer's saved-address book, while still allowing a one-time address for a single order — matching a backend contract that already exists (confirmed against pasted Java source, not guessed).

## 2. Backend contract (source of truth — verified against pasted Java source)

### `GET/POST/PUT/DELETE /customer/addresses`, `POST /customer/addresses/{id}/default`
`UserAddressController` (`@PreAuthorize("hasRole('CUSTOMER')")`).

**Request (`UserAddressDto`)** — full replace on update, all required except `addressLine2`:
```
firstName, lastName, street, houseNumber, addressLine2?, postalCode, city, country
```
No `phone` field. `country` is NOT restricted to allowed-shipping-countries at the address-book level (only enforced on the order's ad-hoc address) — irrelevant for now since the UI only ever creates `country: "DE"` addresses.

**Response (`UserAddressResponseDto`)** — adds `id`, `isDefault` (wire key is literally `"isDefault"` per an explicit `@JsonProperty`), `createdAt`, `updatedAt`.

### `POST /orders` (`CreateOrderDto`, `@ExactlyOneAddressSource`)
```
items: [{ listingId, quantity }]
shippingAddress?: ShippingAddressDto   // ad-hoc, full inline address
savedAddressId?: number                // references a UserAddress row
notes?: string
discountCode?: string
```
Backend enforces exactly one of `shippingAddress` / `savedAddressId` — never both, never neither.

**`ShippingAddressDto`** — same fields as `UserAddressDto` **plus** `phone?` (pattern `^[+0-9 ()-]*$`, max 30), and a stricter `postalCode` (`^\d{5}$`, German-only, vs. the unrestricted size-only check on `UserAddressDto`).

This corrects the frontend's current `orderApi.ts`, which has drifted from the real contract (`fullName` instead of `firstName`/`lastName`, no `houseNumber`/`addressLine2`, no `savedAddressId` at all).

## 3. The phone-field resolution

`UserAddressDto`/`ResponseDto` has no `phone`; only ad-hoc `ShippingAddressDto` does. Resolved as:

- **New/ad-hoc address ("Option B")**: `CheckoutAddressForm` includes optional `phone`. Submits as `shippingAddress` on the order — phone included. An optional **"Save this address to my account"** checkbox additionally fires `addressApi.create()` (same fields, minus phone) — best-effort, fire-and-forget, never blocks or fails the order.
- **Saved address ("Option A")**: submits as `savedAddressId` only. No phone sent for that order — this matches the backend's own `ShippingAddressDto.from(UserAddress)`, which never sets phone. Not a gap introduced by the frontend.

This keeps the XOR contract clean: the order's address field is decided once, independent of whether the "save to book" side-effect succeeds.

## 4. Authentication

No dedicated `/login` route exists anywhere in the app. The established, sitewide pattern (`account/page.tsx`, `saved-lists/page.tsx`) is an inline gate that replaces page content when `!isAuthenticated`, using `AuthContext`. Checkout follows the same pattern via a new `CheckoutAuthGate` component (login + register tabs, mirrors `account/page.tsx`'s inline `AuthGate` look, but built fresh since that one isn't exported). No navigation occurs, so "return to checkout after auth" is automatic — the page re-renders once `isAuthenticated` flips true. Cart state already survives in `CartContext`/localStorage regardless. This replaces the current login-only accordion, which didn't actually block the address section from being usable pre-auth.

## 5. Selection stability

`SavedAddressSelector` owns its own address-list and selection state internally via `useState`, fetches once on mount (effect deps contain no cart-derived values), and is rendered unconditionally (no conditional mount/unmount, no cart-derived `key`) once the user is authenticated. A cart quantity change re-renders `checkout/page.tsx`, but since the selector's component instance is never destroyed, React preserves its internal state automatically — selecting saved address #2 survives unrelated re-renders with no extra persistence layer.

## 6. UX priority

Browser autofill → Saved Address → Google Places → manual typing. Concretely:

- All address fields are plain, individually-labeled `<input>`s with correct `autoComplete` attributes from the start (`given-name`, `family-name`, `street-address`/`address-line1`, `address-line2`, `postal-code`, `address-level2`, `country`, `tel`) — browser autofill works with zero JS involved.
- When the customer has ≥1 saved address, `SavedAddressSelector` defaults to showing the saved-address list (default address preselected). When they have none, it auto-shows the new-address form.
- Google Places is a secondary, unobtrusive enhancement on the street field only (small suggestions dropdown under the input) inside the new-address form — never a "search-first" replacement of the field set, never required.
- Best-effort avoidance of redundant Places lookups right after browser autofill: the debounced fetch only fires when `e.nativeEvent.inputType` is a genuine keystroke edit (`insertText` / `deleteContentBackward` / `deleteContentForward`). Chrome/Edge autofill fires `insertReplacementText`, which is excluded. Not airtight across every browser, but fails safe (worst case: one harmless extra lookup).

## 7. Components

New files under `app/(root)/checkout/components/` unless noted:

| Component | Responsibility |
|---|---|
| `CheckoutAuthGate.tsx` | Login/register tabs gating the page when unauthenticated |
| `SavedAddressSelector.tsx` | Fetches `addressApi.getAll()`, renders selectable `AddressCard`s, preselects default, opens `AddressDialog` for add/edit, calls `addressApi.remove`/`setDefault` directly, owns all selection state, exposes the resolved `{ mode: 'saved', id } \| { mode: 'new', address, saveToBook }` via `onChange` to the parent (`address` here includes `phone`; `saveToBook` is the checkbox state) |
| `AddressCard.tsx` | Displays one saved address; selected/default visual states, edit/delete actions |
| `AddressDialog.tsx` | Modal on `@radix-ui/react-dialog` (already a dependency), Enunas-styled, hosts `CheckoutAddressForm` for add/edit |
| `CheckoutAddressForm.tsx` | The field-set: firstName, lastName, street, houseNumber, addressLine2, postalCode, city, country (DE, locked/disabled selector), phone (optional — rendered only when used for the ad-hoc "new address" path, not when editing a saved address in the book). Embeds `AddressAutocomplete` on the street field. |
| `AddressAutocomplete.tsx` | Google Places (New) suggestions for the street input. Fully no-ops (renders nothing extra, zero network calls) when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is unset. |

Shared logic (not components):

- `lib/api/modules/addressApi.ts` — `getAll`, `create`, `update`, `remove`, `setDefault`, mirroring the existing `wardrobeApi.ts` style.
- `lib/address.ts` — pure functions: field validation (required, German 5-digit postal code, max lengths matching the backend's `@Size` constraints), and `parseGooglePlaceComponents()` (Google `AddressComponent[]` → partial form fields).
- `lib/googleMaps.ts` — lazy-loads `google.maps.importLibrary('places')` once (cached promise), only when a key is configured and only on first use.
- `types/api.ts` — add `ApiUserAddress` mirroring `UserAddressResponseDto`.
- `lib/api/modules/orderApi.ts` — correct `ShippingAddressDto`/`CreateOrderDto` to match the real backend (§2), add `savedAddressId`.

## 8. Google Places integration detail

- Loads `google.maps.importLibrary('places')` lazily (never on page load).
- `AutocompleteSuggestion.fetchAutocompleteSuggestions()` + `AutocompleteSessionToken` (Places API New, session-billed), debounced 300ms, `includedRegionCodes: ['de']`.
- On selection: `place.fetchFields({ fields: ['addressComponents'] })`, parsed into street/houseNumber/postalCode/city; country forced to `DE`. Session token discarded after selection — next keystroke starts a fresh session (stops requests after selection, per spec).
- Every fields is left fully editable afterward — nothing is locked.
- Any failure (no key, script blocked, network error, quota) silently falls back to a plain input. Never throws, never blocks typing or submission.

## 9. Checkout page changes

`app/(root)/checkout/page.tsx`:
- Wrap the whole form in the auth gate: unauthenticated → `CheckoutAuthGate` (replaces current login accordion in the Kontakt section; that whole branch becomes dead code once the top-level gate exists, so it's removed).
- Replace the inline "Lieferadresse" `<section>` with `<SavedAddressSelector onChange={setAddressSelection} />`.
- `handleSubmit` builds `CreateOrderDto` with either `savedAddressId` or `shippingAddress` from `addressSelection`, never both.
- Payment method selection, order summary, discount-code auto-apply are untouched.

## 10. Validation

Frontend-only, UX purposes: required-field presence, German postal code `^\d{5}$`, max lengths mirroring backend `@Size` constraints (firstName/lastName 100, street/addressLine2 255, houseNumber 16 + pattern, postalCode 16, city 128, phone 30 + pattern). No business-rule duplication — backend remains authoritative and its error messages surface as-is on failure.

## 11. Error handling

- Address list load fails → inline error message + retry button + the new-address form still available (never a dead end).
- Address save/update/delete fails → error surfaced in the dialog, dialog stays open, no optimistic mutation of the list.
- Google Places unavailable at any stage → silent fallback to manual typing, no user-facing error.
- Order submission failure → existing error-banner pattern in checkout, untouched.

## 12. Out of scope

- `app/(root)/account/components/Adressen.tsx` — stays on mock data. Same `addressApi` could power it later; not part of this change.
- Payment methods, discount codes, order summary — untouched.
- Non-Germany shipping — country selector stays locked to DE per the MVP constraint.
