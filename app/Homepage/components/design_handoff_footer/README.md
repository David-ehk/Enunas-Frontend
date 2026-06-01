# Handoff: Enunas Storefront — Footer

> **For Claude Code / a developer.** This package is a high-fidelity design
> reference for the Enunas storefront footer. Recreate it faithfully in the
> production codebase using the codebase's own stack and conventions.

## Overview

The site-wide footer for **Enunas**, an editorial-luxury × streetwear curated
fashion marketplace (German-first, EUR). It is an editorial **"colophon"**:
a large wordmark band, numbered link columns, a payment-methods block, a social
+ locale utility row, and a legal bar.

It shares one design language with the **Mega Navigation** (delivered
separately): sharp corners, 1px hairlines, a single aubergine accent, tracked
uppercase **League Spartan**, italic-capable **Cormorant Garamond** display, and
small **registration corner ticks** as an editorial detail. Three surface
treatments are provided as a design exploration (see Tweaks).

---

## About the Design Files — READ FIRST

These files are a **design reference built in HTML + React-via-CDN with
in-browser Babel.** They demonstrate the intended look, layout, and behaviour.
**This is NOT production code to copy verbatim.**

Prototype-only conventions you must NOT carry over:

- React + Babel loaded from `unpkg` CDN via `<script type="text/babel">`.
- Components/data shared through global `window` assignment and `/* global */`
  comments instead of imports.
- The **Tweaks panel** (`tweaks-panel.jsx`) — a design-exploration tool. **Drop
  it entirely.** Pick one `surface` value and ship it (see step 3 below).
- The **`.page-filler`** spacer block — only there so the footer can be viewed
  standalone.
- The `/*EDITMODE-BEGIN*/ … /*EDITMODE-END*/` marker around `TWEAK_DEFAULTS`.

**Target stack (recommended):** React + TypeScript + Vite, CSS Modules or
Tailwind. Port the tokens first, then build the footer as real components driven
by a data source. No dependencies beyond React are required.

---

## Fidelity

**High-fidelity.** Final colours, type, spacing, motion, and interaction
patterns. Recreate faithfully with the codebase's component library and icon
set. Exact tokens are in the **Design Tokens** section and `colors_and_type.css`.

The link labels, payment methods, and social links in `footer-data.jsx` /
`footer-app.jsx` are **realistic mock content** — wire them to the real routes /
config in production.

---

## Layout

A full-width band, `padding: 92px 64px 30px`, content capped at `max-width:
1680px` and centred. Vertical structure, top → bottom:

```
┌──────────────────────────────────────────────────────────────────┐
│  ▏(corner tick top-right)                                          │
│                                                                    │
│  Enunas                              Der kuratierte Marktplatz     │  ← colophon band
│  (Cormorant, 64px)                   FÜR DESIGNER & STREETWEAR      │
│  ───────────────────────────────────────────────────── hairline   │
│                                                                    │
│  01 ÜBER UNS   02 HILFE   03 RECHTLICHES   04 ZAHLUNGSARTEN        │  ← 5-col grid
│  · Über uns    · FAQs     · Impressum      [visa][mc ][amex]       │     (4 link cols
│  · Marken      · Sendung… · AGBs           [pp  ][klar][ pay]      │      + pay col)
│  · Designer    · Liefer…  · Cookie-Rich…   🔒 SSL · Käuferschutz   │
│  · Karriere    · Kundens… · …                                      │
│  ───────────────────────────────────────────────────── hairline   │
│  [ig][x][fb][pin]                          🌐 DEUTSCHLAND · EUR €  │  ← utility row
│  ───────────────────────────────────────────────────── hairline   │
│  ⊙ ENUNAS 2026 — ALLE RECHTE VORBEHALTEN          NACH OBEN ↑      │  ← legal bar
│  ▏(corner tick bottom-left)                                        │
└──────────────────────────────────────────────────────────────────┘
```

- **Colophon band** (`.foot-top`): flex row, wordmark left / tagline right,
  hairline divider beneath.
- **Columns** (`.foot-cols`): CSS grid `repeat(4, 1fr) 1.1fr`. Four link columns
  + a wider payment column. Each column header = a 2-digit index + a tracked
  uppercase title.
- **Payment block**: a **3 × 2 grid** of uniform `56 × 38` tiles
  (`grid-template-columns: repeat(3, 56px)`), plus an SSL/Käuferschutz note with
  a lock glyph.
- **Utility row** (`.foot-utility`): social tiles left, locale chip right,
  hairlines top & bottom.
- **Legal bar** (`.foot-legal`): copyright left, a "Nach oben" (back-to-top)
  button right.
- **Registration corner ticks**: 15px L-shaped 1px marks at top-right and
  bottom-left of `.foot-inner` (`::before` / `::after`).

### Responsive
- `≤ 1080px`: columns collapse to `repeat(2, 1fr)`; colophon band stacks; tagline
  left-aligns.
- `≤ 620px`: single column; wordmark 48px; utility row stacks.

---

## Surfaces (theming)

A `data-surface` attribute on `.foot` swaps a set of CSS variables
(`--fg`, `--muted`, `--faint`, `--hair-c`, `--hair-str`, `--foot-bg`, `--acc`,
`--tile-bg`, `--tile-bd`). **Pick ONE for production** (recommended: `purple` —
it matches the current live site).

| `data-surface` | Background | Text | Reference |
|---|---|---|---|
| `purple` *(default, recommended)* | aubergine `#370E4D` | white | current Enunas |
| `ink` | ink black `#0A0A0A` | white | McQueen |
| `cream` | cream `#F5F5F0` | ink, bordered tiles | Dior / Rochas |

On dark surfaces the accent is lightened via `color-mix` so hovers read on the
dark background; payment tiles stay on white tiles for brand-mark legibility
(on cream they get a 1px hairline border instead).

---

## Interactions & Motion

- **Link hover**: an aubergine 1px underline draws in left→right (`scaleX`),
  text brightens to full foreground.
- **Payment tile hover**: lifts `translateY(-3px)`.
- **Social tile hover**: inverts (fg background, bg-coloured glyph).
- **Locale chip hover**: border brightens to full foreground.
- **Back-to-top**: smooth-scrolls to top; arrow nudges up on hover.
- **Scroll reveal**: an `IntersectionObserver` adds `.in` when the footer enters
  the viewport, triggering a staggered fade+rise of items (`.reveal-item`, with
  `.reveal-d1…d5` delay steps). **Important hardening to keep:**
  - the hidden initial state is gated behind an `armed` class added in JS, so if
    JS/animation never runs, content is never stuck invisible;
  - a `setTimeout` fallback reveals the footer if the observer never fires;
  - `@media (prefers-reduced-motion: reduce)` disables the motion entirely.
- The **Motion** tweak (subtle / standard / expressive) just scales animation
  duration via `data-motion`; map it to your motion-preference handling or drop
  it and keep `standard`.

---

## Data needs

Replace the mock content with real config/CMS data of the same shape.

`footer-data.jsx` → `FOOTER_COLS`:
```js
[
  { title: "Über uns",    links: ["Über uns", "Marken", "Designer", "Karriere"] },
  { title: "Hilfe",       links: ["FAQs", "Sendungsverfolgung", "Lieferung & Rücksendung", "Kundenservice"] },
  { title: "Rechtliches", links: ["Impressum", "AGBs", "Cookie-Richtlinien", "Cookie-Einstellungen", "Nutzungsbedingungen", "Datenschutzerklärung"] },
]
```
Each `link` needs a real `href`/route in production (here they are `#`).

**Payment methods** (`PAY_LIST` in `footer-app.jsx`), in display order:
Visa · Mastercard · American Express · PayPal · Klarna · Apple Pay.
**Social** (`SOCIAL_LIST`): Instagram · X (Twitter) · Facebook · Pinterest —
give each a real profile URL and keep the `aria-label`.

> The payment & brand logos here are **lightweight inline-SVG approximations**
> for layout. In production, use the official brand marks (correct licensed
> assets / an icon set), keeping the uniform `56 × 38` tile and the 3 × 2 grid.

---

## Design Tokens

Defined in **`colors_and_type.css`** (shared design system) + footer-local vars
at the top of **`footer.css`**.

### Colour
```
--cream      #F5F5F0   cream surface
--paper      #FBFBF8   lighter cream
--white      #FFFFFF
--ink        #0A0A0A   ink surface / text
--gray-m     #6B6B6B   muted text
--hair       #E2E2DC   hairlines on light
--aubergine  #370E4D   sole brand accent + default surface
```
Monochrome + one aubergine accent. No gradients. No shadows. Square corners
everywhere (only the lock-note and brand glyphs have intrinsic radii).

### Typography
| Family | Weights | Use |
|---|---|---|
| **Cormorant Garamond** | 300 (+ italic) | Wordmark / colophon only |
| **League Spartan** | 400 / 500 | Everything else |

- **Eyebrow / column title**: `12px · letter-spacing 0.26em · uppercase · 500`.
- **Column index**: `10px` tabular-nums, faint.
- **Links**: `13.5px · letter-spacing 0.03em`, muted → full-fg on hover.
- **Wordmark**: Cormorant 300, 64px (48px mobile).
- **Micro-labels** (pay note, copyright, locale, back-to-top): `10–11px ·
  letter-spacing 0.16–0.22em · uppercase`.

### Spacing & shape
- Section paddings ~54–64px; `.foot-cols` gap 40px; tile gap 8px.
- **Border radius: 0** on all layout/UI; hairlines `1px solid`.
- Social tiles `42 × 42`; payment tiles `56 × 38`.

### Motion
- Easing `cubic-bezier(0.16, 1, 0.3, 1)` (primary), `cubic-bezier(0.25,1,0.5,1)`
  (small hovers).
- Reveal 760ms (subtle 460 / expressive 1080), stagger 60–440ms.
- Underlines/borders ease; no bounce.

---

## Components inventory

Prototype (in `footer-app.jsx`):

| Component | Role |
|---|---|
| `App` | Mounts the footer + (prototype) Tweaks panel |
| `Footer` | The whole footer; owns the IntersectionObserver reveal |
| `Pay` | Inline-SVG payment marks (visa, mc, amex, pp, klarna, applepay) |
| `Social` | Inline-SVG social glyphs |
| `Glyph` | UI glyphs (lock, globe, copy, up) |

Suggested production decomposition: `Footer` → `Colophon`, `FooterColumn`
(×4, data-driven), `PaymentMethods`, `FooterUtility` (social + locale),
`FooterLegal`. Drive columns and lists from one data source.

---

## Files

```
footer/
  Footer.html          entry point — open directly in a browser, no build step
  colors_and_type.css  design tokens (SHARED SOURCE OF TRUTH)
  footer.css           all footer layout, surface theming, motion
  footer-app.jsx       React app — Footer + Pay/Social/Glyph + (prototype) Tweaks
  footer-data.jsx      mock link columns (FOOTER_COLS)
  tweaks-panel.jsx     prototype tweaks panel — DO NOT SHIP
  fonts/               Cormorant Garamond + League Spartan (SIL OFL)
```

### Preview
Open `Footer.html` directly in a browser — no build step (React + Babel load
from CDN). Scroll down to trigger the reveal; toggle the Tweaks panel (toolbar)
to compare the purple / ink / cream surfaces.

---

## Implementation checklist

1. **Port `colors_and_type.css` tokens** into the codebase's token layer first.
2. **Build the footer as real components** from one data source; wire links,
   social URLs, locale, and back-to-top to real behaviour.
3. **Pick ONE surface** (`purple` recommended) and delete the others + the
   Tweaks panel + the `.page-filler` spacer.
4. **Swap the inline-SVG payment/brand marks** for licensed official marks,
   keeping the `56×38` tile and the **3 × 2 grid**.
5. **Keep the reveal hardening**: `armed` gate + observer + `setTimeout`
   fallback + `prefers-reduced-motion` opt-out (or drop the reveal and render
   static).
6. **Accessibility**: real `<nav aria-label>` per column (present), descriptive
   `aria-label`s on icon-only buttons (present), visible focus states, and AA
   contrast — verify muted greys on each chosen surface.
7. **Responsive**: confirm the `≤1080px` (2-col) and `≤620px` (1-col) breakpoints
   against the codebase's grid system.
```
