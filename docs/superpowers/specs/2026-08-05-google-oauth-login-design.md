# Google OAuth Login — Design Spec

**Date:** 2026-08-05
**Status:** Approved
**Scope:** Adds "Continue with Google" as an additional auth method on the two customer-facing login/register surfaces. Does not touch the dashboard staff login (`app/(dashboard)/dashboard/login/page.tsx`) — different security context, explicitly out of scope per user decision.

## 1. Backend contract (verified against pasted Java source)

`POST /auth/google` — `AuthController.loginWithGoogle`, live.

Request (`GoogleAuthDto`): `{ "idToken": "<google-id-token-jwt>" }` — `idToken` is `@NotBlank`.

Response (`LoginResponseDto`, identical shape to `/auth/login`): `{ "token": "<enunas-jwt>", "expiresIn": 86400000 }`. `200 OK` on success.

Backend verifies signature/issuer/audience/expiration via `GoogleTokenVerifier` before issuing the Enunas JWT — the frontend never verifies identity itself, only relays the Google ID token.

Status codes:
- `400` — invalid/unverifiable Google token, or unverified email on a new/unlinked account
- `409` — resolved account exists but is disabled/pending approval (same gate as `/auth/login`)
- `422`/`500` — not expected in normal operation

Error body shape is the same global format every endpoint in this API uses: `{ timestamp, status, error, message }`.

## 2. Error handling — deliberately does NOT reuse the existing "show err.message" convention

The existing email/password forms (`CheckoutAuthGate`, account's `AuthGate`) show `FetchError.message` verbatim. This feature's own instructions say *"never expose backend errors directly"* — a deliberate departure for this path specifically. `lib/googleAuthErrors.ts` exports `mapGoogleAuthError(err: unknown): string`, mapping by **HTTP status code** for the MVP:

- `400` → "Die Google-Anmeldung konnte nicht verifiziert werden. Bitte versuche es erneut."
- `409` → "Dieses Konto ist derzeit gesperrt oder wartet auf Freigabe. Bitte kontaktiere den Support."
- non-`FetchError` (network failure) → "Netzwerkfehler. Bitte überprüfe deine Verbindung und versuche es erneut."
- anything else → "Google-Anmeldung fehlgeschlagen. Bitte versuche es erneut."

Structured as a single lookup function so that if the backend later adds stable machine-readable error codes (e.g. `GOOGLE_ACCOUNT_DISABLED`) instead of relying on status alone, only this one function changes — call sites are unaffected.

## 3. Google Identity Services — load once, initialize once, render per-mount

`lib/googleIdentity.ts` owns three module-level pieces of state:
- a cached script-load promise (script tag injected at most once per page lifetime, mirroring `lib/googleMaps.ts`'s pattern)
- an `initialized` flag — `google.accounts.id.initialize({ client_id, callback })` is called **exactly once**, ever, regardless of how many `GoogleLoginButton` instances mount/unmount (React re-renders, tab switching between login/register) — repeated `initialize()` calls are exactly the "odd behavior" risk flagged in review
- a mutable "active callback" slot, updated via an exported `setGoogleCredentialHandler(handler)` that each mounted `GoogleLoginButton` registers on mount and clears on unmount

`initialize()`'s own `callback` is a single stable dispatcher that forwards the credential to whichever handler is currently registered. Sequence: **load script → initialize once → render button** (`renderButton()` runs per-mount, into that mount's own container — this part is cheap and safe to repeat).

Only one `GoogleLoginButton` is ever visible at a time in current usage (login/register tabs are mutually exclusive), so "last mounted wins, clear on unmount" is sufficient — noted as a simplifying assumption, not a hidden bug, in a code comment.

## 4. Missing `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — dev vs. prod behavior differ (per review)

- **Development** (`NODE_ENV === 'development'`): render a visible, disabled placeholder ("Google Sign-In nicht konfiguriert — NEXT_PUBLIC_GOOGLE_CLIENT_ID fehlt") instead of hiding anything, **and** `console.error(...)` a clear one-line message. A missing env var must be loud in dev.
- **Production**: render nothing (`null`) — a silently-missing login *option* is acceptable UX (email/password still works); a silently-broken *button* would not be.

## 5. Order of operations (explicit, per review)

Google button click → Google's popup → GIS callback fires with credential → `authApi.loginWithGoogle(idToken)` → backend verifies + returns `{ token, expiresIn }` → `setToken()` (inside `authApi.loginWithGoogle`, mirroring `login()` exactly) → **only then** `refreshUser()` from `AuthContext` → `onSuccess?.()`. `refreshUser()` is never called before the token is stored.

## 6. Components / files

| File | Purpose |
|---|---|
| `lib/api/modules/authApi.ts` | add `loginWithGoogle(idToken): Promise<void>` — mirrors `login()` |
| `lib/googleIdentity.ts` | load-once/initialize-once GIS loader (§3) |
| `types/google-identity.d.ts` | minimal ambient types for `google.accounts.id.*` (no new dependency, same approach as the Places types) |
| `lib/googleAuthErrors.ts` | `mapGoogleAuthError()` (§2) |
| `components/auth/GoogleLoginButton.tsx` | the reusable, self-contained unit (§7) — lives under top-level `components/` since it's shared across the `account` and `checkout` route groups |

## 7. `GoogleLoginButton` component

Props: `context: 'login' | 'register'` (maps to Google's button `text` option — "Sign in with Google" vs "Sign up with Google" framing only; identical backend call either way), `onError: (message: string) => void` (parent renders it in its own existing error slot — no separate error UI), `onSuccess?: () => void`.

Renders its own "oder" divider plus Google's official button as one self-contained block (parents drop it in with zero extra markup, satisfying "reusable... without duplicating logic"). Uses Google's `renderButton()` (not a hand-built purple button) — Google's branding guidelines require using their button surface as-is, and a custom button can't reliably drive the popup-to-ID-token flow. Styled via the parameters Google does allow (`shape: 'pill'` to match `.btn-primary`'s rounded look, full width, sized to fit each form) — everything around it (divider, spacing, placement) is pure Enunas.

Internally: registers/unregisters itself with `setGoogleCredentialHandler` on mount/unmount; on receiving a credential, sets a local `submitting` state (dims/disables the button's container — see §8), calls `authApi.loginWithGoogle`, then `refreshUser()`, then `onSuccess?.()`; on failure, calls `mapGoogleAuthError(err)` and passes the result to `onError`.

## 8. Popup cancellation / loading state

With `renderButton()`'s flow, closing Google's popup without picking an account fires **no callback at all** — there's nothing to reset, since our own `submitting` state only starts once a credential is actually received and the backend call begins. That call is wrapped in try/finally, so the button's container is never left in a stuck disabled state — closing the popup or a failed backend call both leave it immediately clickable again (retry is just "click again").

## 9. No separate auth state

`GoogleLoginButton` calls the *same* `refreshUser()` from the *same* `AuthContext` as the existing email/password paths. After success, `isAuthenticated`/`user`/`customer` are populated identically regardless of which method was used — the rest of the app (protected routes, logout, token refresh) has no branch for "how did this user log in."

## 10. Future-proofing (comment only, no code changes now)

The flow is provider-agnostic in shape: `Provider button → provider ID token → POST /auth/{provider} → Enunas JWT → existing AuthContext`. A comment in `GoogleLoginButton.tsx` notes this so a future Apple/other-provider button wouldn't require restructuring `AuthContext` — just another similarly-shaped button + endpoint. No abstraction is introduced now (YAGNI) — this is a note against hard-coding Google-only assumptions where they'd cost nothing to avoid, not a request to build a provider system.

## 11. CSP note (not an MVP blocker)

Google Identity Services loads script/frame/connect resources from Google's own domains (`accounts.google.com` and related). Documented here so that if a strict CSP is introduced later, `script-src`/`frame-src`/`connect-src` allowlist entries for Google's origins are added at the same time — otherwise the login popup silently stops working.

## 12. Where it's added

`app/(root)/checkout/components/CheckoutAuthGate.tsx` (both login and register tabs) and `app/(root)/account/page.tsx`'s local `AuthGate` function (both tabs) — inserting `<GoogleLoginButton>` only, no other changes to either file. Validation, error mapping, and GIS lifecycle all live in the shared component/lib files above, not duplicated per call site.

## 13. Out of scope

- Dashboard staff login (`dashboard/login/page.tsx`) — explicitly excluded per user decision.
- Any other OAuth provider (Apple, etc.) — noted for future extensibility only, not built.
- Account linking UI/flows beyond what the backend already handles internally (`authenticationService.loginWithGoogle`).
