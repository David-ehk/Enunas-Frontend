# Handoff: Enunas Storefront — Cart Drawer

> **For Claude Code / a developer.** This package is a high-fidelity design
> reference for the Enunas cart drawer. Recreate it faithfully in the production
> codebase using the codebase's own stack and conventions.

## Overview

The slide-in **cart drawer** for **Enunas**, an editorial-luxury × streetwear
curated fashion marketplace (German-first, EUR). It opens from the right edge
over a dimmed storefront and combines two tabs — **Warenkorb** (cart) and
**Wunschliste** (wishlist) — a free-shipping progress bar, line items with
quantity steppers, and a sticky order summary with the checkout CTA.

It shares one design language with the **Mega Navigation** and **Footer**
(delivered separately): sharp corners, 1px hairlines, a single aubergine accent,
tracked uppercase **League Spartan**, italic-capable **Cormorant Garamond**
display, and small **registration corner ticks** as an editorial detail. Three
surface treatments are provided as a design exploration (see Tweaks).

This replaces an earlier, flatter cart drawer (numbered item rows, text-only
free-shipping line, square `+/−` boxes).

---

## About the Design Files — READ FIRST

These files are a **design reference built in HTML + React-via-CDN with
in-browser Babel.** They demonstrate the intended look, layout, and behaviour.
**This is NOT production code to copy verbatim.**

Prototype-only conventions you must NOT carry over:

- React + Babel loaded from `unpkg` CDN via `<script type="text/babel">`.
- Components shared through global scope + `/* global */` comments, not imports.
- The **Tweaks panel** (`tweaks-panel.jsx`) — a design-exploration tool. **Drop
  it entirely.** Pick one `surface` value and ship it (see step 3 below).
- The faux storefront behind the drawer (`.site`, `.site-hero`, `.site-nav`) and
  the bottom **"Warenkorb öffnen"** reopen button — both exist only so the drawer
  can be demoed standalone. In production the drawer mounts in the real app and
  is triggered by the header bag button.
- The `/*EDITMODE-BEGIN*/ … /*EDITMODE-END*/` marker around `TWEAK_DEFAULTS`.

**Target stack (recommended):** React + TypeScript + Vite, CSS Modules or
Tailwind. The codebase already has a cart route (`app/(root)/cart/...`) and a
`CartItemRow`/`FreeShippingBar` pattern — align with those. No dependencies
beyond React are required for this reference.

---

## Fidelity

**High-fidelity.** Final colours, type, spacing, motion, and interaction
patterns. The mock items, prices, brands, sizes, and the free-shipping threshold
are **realistic placeholder data** — wire to the real cart/wishlist state.

---

## Layout

A fixed full-height panel pinned to the right, `width: min(468px, 100vw)`, a
vertical flex column. Top → bottom:

```
┌────────────────────────────────────────────┐
│  Warenkorb ²   Wunschliste ²            ✕   │  ← tabbed header (sticky)
│  ────────────────────────────────────────  │     hairline
│  KOSTENLOSER VERSAND FREIGESCHALTET  600/500│  ← free-ship bar (cart tab only)
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ track  │
│  ──────────────────────────────────────── │
│  ┌────┐  6PM                          🗑   │  ← scrollable item list
│  │img │  Oversized Structured Blazer       │
│  │    │  Größe S                            │
│  └────┘  [− 1 +]                  180,00 € │
│  ──────────────────────────────────────── │
│  ┌────┐  Vivienne Westwood            🗑   │
│  │img │  Worlds End Denim Boxer Jacket      │
│  │    │  ▩ Lila · Größe S                   │
│  └────┘  [− 1 +]                  420,00 € │
│ ▏(corner tick)                              │
│  Zwischensumme                     600,00 € │  ← summary (sticky, cart tab)
│  Versand                          Kostenlos │
│  ──────────────────────────────────────── │
│  Gesamt  2 Artikel                 600,00 € │
│                                  inkl. MwSt.│
│  🔒 SICHER ZUR KASSE                        │  ← aubergine CTA (shimmer on hover)
│            Weiter einkaufen                 │
│  🔒 SSL-VERSCHLÜSSELT · KÄUFERSCHUTZ        │
│ ▏(corner tick)                              │
└────────────────────────────────────────────┘
```

Sections (all defined in `cart.css`):
- **`.cart-head`** — sticky; the two `.cart-tab`s (Cormorant, with a superscript
  count `.tab-n` and a draw-in underline on the active tab) + a rotating close.
- **`.ship`** — free-shipping progress; **only on the cart tab with ≥1 item.**
  A 2px `.ship-track` with a `.ship-fill` whose width is driven by a `--pct`
  CSS var; the message swaps between "Noch X € bis…" and "…freigeschaltet".
- **`.cart-body`** — the scroll region (`flex: 1; overflow-y: auto`). Holds
  `.item` rows or an `.empty` state.
- **`.summary`** — sticky footer; **only on the cart tab with ≥1 item.** Subtotal
  / Versand / Gesamt, VAT note, checkout CTA, "Weiter einkaufen", trust line, and
  two registration corner ticks.

### Item row (`.item`)
`grid-template-columns: 92px 1fr`: a `92×120` image tile (image zooms on hover)
+ a main column with brand eyebrow, Cormorant name, a trash remove button,
attribute chips (`.item-attr` — a color shows a `9×9` swatch square + label,
size shows "Größe S"), then a bottom row with the **stepper** and line price.

### Stepper (`.stepper`)
A sharp hairline-bordered group: `−` button · qty (tabular-nums, hairline-
separated) · `+` button. Buttons invert to the accent on hover; `−` disables at
qty 1.

### Wishlist row (`.wish-item`)
Same skeleton, but the bottom-left control is a **"In den Warenkorb"** outline
button (`.move-to-cart`) instead of a stepper, and the price is the unit price.

### Empty states (`.empty`)
Centered icon + Cormorant title + sub-line. Cart-empty offers a "Weiter
einkaufen" link; wishlist-empty is informational.

### Responsive
`≤ 480px`: drawer goes full-width; the summary corner ticks are hidden.

---

## Surfaces (theming)

A `data-surface` attribute on `.cart` swaps a local set of CSS variables
(`--bg`, `--panel`, `--fg`, `--muted`, `--faint`, `--hair-c`, `--acc`, `--ship`).
**Pick ONE for production** (recommended: `cream` — matches the storefront).

| `data-surface` | Drawer bg | Panel/summary bg | Text |
|---|---|---|---|
| `cream` *(default, recommended)* | `#F5F5F0` | `#FBFBF8` | ink |
| `white` | `#FFFFFF` | `#FAFAF7` | ink |
| `ink` | `#0A0A0A` | `#161616` | cream; accent lightened, success → sage |

---

## Interactions & State

All local component state in the prototype (`Cart` component):

- `tab` — `"cart"` | `"wish"`.
- `cart` — array of line items `{ id, brand, name, img, size?, color?, sw?,
  price (cents), qty }`.
- `wish` — array of wishlist items (same shape, no `qty`).
- `removing` — id of the row currently animating out.

Behaviours:
- **Tab switch** toggles the list; the free-ship bar and summary render **only**
  on the cart tab with items.
- **Qty +/−** (`setQty`) clamps at a minimum of 1; line price and all summary
  figures recompute.
- **Remove** (`removeItem`) sets `removing` → plays the `.removing` slide/fade
  (`itemOut`, 400ms) → then drops the item from state.
- **Move to cart** (`moveToCart`) removes from wishlist, adds to cart (merges
  qty if the same product already exists), and switches to the cart tab.
- **Free shipping** is computed: `subtotal >= SHIP_THRESHOLD` (€500) → free,
  else `SHIP_COST` (€6.90) and a "remaining" amount; `--pct` = `subtotal /
  threshold`.
- **Escape** closes the drawer; clicking the scrim closes; the storefront blurs
  while open.
- Money is formatted with **`Intl.NumberFormat('de-DE', { style: 'currency',
  currency: 'EUR' })`** — keep this, don't hand-roll `toFixed().replace`.

**Production data needs:** real cart & wishlist state from the store/session;
the free-shipping threshold + shipping cost from config (here `SHIP_THRESHOLD`,
`SHIP_COST` constants — move to a `constants.ts`); item `href`s to PDPs; and the
checkout button wired to the checkout route.

---

## Design Tokens

Defined in **`colors_and_type.css`** (shared design system) + cart-local vars at
the top of `cart.css`.

### Colour
```
--cream      #F5F5F0   drawer surface (default)
--paper      #FBFBF8   summary / image-tile panels
--white      #FFFFFF
--ink        #0A0A0A   ink surface / primary text
--gray-m     #6B6B6B   muted labels, captions
--hair       #E2E2DC   hairlines
--aubergine  #370E4D   sole brand accent (active tab, stepper hover, CTA)
--success    #1A5A3C   free-shipping confirmed / "Kostenlos"
--error      #8B1E3F   remove (trash) hover
```
Monochrome + one aubergine accent + semantic success/error. No gradients (the
CTA shimmer is a single sweeping highlight, not a gradient fill). No shadows
except the drawer's one soft elevation over the storefront. Square corners
everywhere.

### Typography
| Family | Weights | Use |
|---|---|---|
| **Cormorant Garamond** | 400 / 300 | Tab labels, item names, Gesamt, totals, empty titles |
| **League Spartan** | 400 / 500 | Everything else — eyebrows, attrs, buttons, summary labels |

- **Brand eyebrow / summary labels**: `10–11px · letter-spacing 0.14–0.26em ·
  uppercase · muted`.
- **Item name**: Cormorant 400, 19px.
- **Tab label**: Cormorant 400, 23px (active = full fg, inactive = faint).
- **Line price**: Cormorant 400, 19px, tabular-nums. **Grand total**: Cormorant
  27px.
- **CTA**: League Spartan, 12px, `letter-spacing 0.26em`, uppercase, white on
  aubergine.

### Spacing & shape
- Drawer padding 26–30px; item rows 26px vertical with hairline dividers.
- Image tile `92×120`; stepper buttons `30×30`; CTA padding 18px.
- **Border radius: 0** on all UI; hairlines `1px solid`.

### Motion
- Easing `cubic-bezier(0.16, 1, 0.3, 1)` (primary), `cubic-bezier(0.25,1,0.5,1)`
  (small hovers).
- Drawer slide-in 720ms; item stagger-in (`itemIn`) 80–320ms delays, 620ms each;
  remove (`itemOut`) 400ms; ship-fill width 900ms; CTA shimmer 720ms.
- The **Motion** tweak (subtle / standard / expressive) scales item-animation
  duration via `data-motion`; map to motion-preference handling or keep standard.
- Add `@media (prefers-reduced-motion: reduce)` to disable entrance motion in
  production (the prototype does not yet).

---

## Components inventory

Prototype (in `cart-app.jsx`):

| Component | Role |
|---|---|
| `App` | Storefront stage + open/close (Escape, scrim) + (prototype) Tweaks |
| `Cart` | The drawer; owns tabs, cart/wish state, totals, all handlers |
| `CartItem` | A cart line row (image, details, stepper, price, remove) |
| `WishItem` | A wishlist row (image, details, move-to-cart, price, remove) |
| `Stepper` | Qty −/value/+ control |
| `I` | Inline 1.4–1.6px-stroke SVG icon set (close, minus, plus, trash, arrow, lock, bag, heart) |

Suggested production decomposition: `CartDrawer` (shell, open state, scrim,
Escape) → `CartTabs`, `FreeShippingBar`, `CartItemRow` / `WishlistItemRow`,
`QtyStepper`, `CartSummary`, `EmptyState`. Drive everything from the real cart
store.

---

## Files

```
cart/
  Cart.html            entry point — open directly in a browser, no build step
  colors_and_type.css  design tokens (SHARED SOURCE OF TRUTH)
  cart.css             all drawer layout, surface theming, motion
  cart-app.jsx         React app — App / Cart / CartItem / WishItem / Stepper + icons + (prototype) Tweaks
  tweaks-panel.jsx     prototype tweaks panel — DO NOT SHIP
  fonts/               Cormorant Garamond + League Spartan (SIL OFL)
  img/                 placeholder product imagery (p1–p4)
```

### Preview
Open `Cart.html` directly in a browser — no build step (React + Babel load from
CDN). The drawer opens on load; switch tabs, change quantities, remove an item,
move a wishlist item into the cart; toggle the Tweaks panel (toolbar) to compare
the cream / white / ink surfaces.

---

## Implementation checklist

1. **Port `colors_and_type.css` tokens** into the codebase's token layer first.
2. **Build the drawer from the real cart/wishlist store**; wire item `href`s,
   the checkout route, and move-shipping config to `constants.ts`.
3. **Pick ONE surface** (`cream` recommended) and delete the others + the Tweaks
   panel + the faux storefront + the reopen button.
4. **Keep `Intl.NumberFormat`** for all money; keep the free-shipping
   computation (threshold/cost from config).
5. **Preserve the remove + move animations** and the staggered item entrance;
   add `prefers-reduced-motion` opt-out.
6. **Accessibility**: the drawer is a `<aside aria-label>`; tabs use
   `role="tab"` + `aria-selected` (present) — pair with `role="tablist"` /
   `tabpanel` and arrow-key support; trap focus while open and restore focus to
   the bag trigger on close; ensure icon-only buttons keep their `aria-label`s
   (present); verify AA contrast of muted greys on each chosen surface.
7. **Responsive**: confirm the full-width `≤480px` behaviour against the
   codebase's breakpoints; ensure the body scrolls while header/summary stay
   pinned.
```
