# Handoff: Enunas Storefront — Mega Navigation

## Overview

The primary storefront navigation for **Enunas**, an editorial-luxury ×
streetwear curated fashion marketplace (German-first, EUR). This replaces the
old left-hand sidebar with a full-height **mega navigation** that slides in
from the left edge over a dimmed storefront.

The design fuses three references with the Enunas dashboard design language:

- **Dior** (`dior.com/fashion`) — the three-zone structure: a category rail, a
  sub-navigation pane, and a large editorial imagery column.
- **Alexander McQueen** (`alexandermcqueen.com`) — the austere, near-black rail
  with tracked uppercase type and generous negative space.
- **Rochas** (`rochas.com`) — warm, editorial cream content panes with italic
  serif display type.
- **Enunas Brand Partner Dashboard** — the "sharpness": square corners,
  1px hairlines, a single aubergine accent, no shadows, no gradients.

The result is a **split-surface** layout: an ink-black rail on the left, warm
cream panes on the right. Three more surface treatments are available as a
design exploration (see Tweaks).

---

## About the Design Files

The files in this bundle are **design references created in HTML/React-via-CDN**
— a prototype that demonstrates the intended look, layout and behaviour. **It is
not production code to copy directly.**

It uses React 18 loaded from a CDN with in-browser Babel transpilation, inline
`<script type="text/babel">` tags, and global `window` assignment to share data
between files. This is a prototyping convention — **do not replicate it in
production.**

Your task is to **recreate this design in the target codebase's environment**
using its established patterns, component library, and build tooling
(recommended: **React + TypeScript + Vite**, CSS Modules or Tailwind for
styling). The prototype intentionally has no external dependencies beyond React.

---

## Fidelity

**High-fidelity.** This is a pixel-considered mockup with final colours,
typography, spacing, motion and interaction patterns. Recreate the UI faithfully
using the codebase's libraries. Exact tokens are listed in the **Design Tokens**
section below and defined in `colors_and_type.css`.

The categories, sub-links, highlights and editorial tiles in `nav-data.jsx` are
**realistic mock content**. Replace with the live navigation tree / CMS-driven
merchandising of the same shape.

---

## Layout — three zones

The menu is a fixed, full-height panel, `min(1320px, 94vw)` wide, laid out as a
CSS grid of three columns:

```
┌──────────────┬───────────────────┬───────────────────────────┐
│  COLUMN 1    │  COLUMN 2         │  COLUMN 3                 │
│  Ink rail    │  Cream sub-nav    │  Editorial imagery        │
│  (312px)     │  (360px)          │  (1fr)                    │
│              │                   │                           │
│  wordmark ·  │  search field     │  ┌─────────┬─────────┐    │
│  close       │  ───────────────  │  │ video   │  tile   │    │
│              │  kicker           │  │ (KB)    │         │    │
│  01 Neu      │  Italic Title     │  ├─────────┼─────────┤    │
│  02 Trendy   │  → Alle ansehen   │  │ tile    │  tile   │    │
│  03 …        │  ───────────────  │  └─────────┴─────────┘    │
│  ▸ 05 Women  │  · sub-link       │   (registration corner    │
│  …           │  · sub-link  ›    │    ticks, top-R / bot-L)   │
│  09 Sale     │  · sub-link       │                           │
│              │  Highlights       │                           │
│  ─────────   │  italic links     │                           │
│  Anmelden ·  │                   │                           │
│  Hilfe       │                   │                           │
│  [DE / EUR]  │                   │                           │
└──────────────┴───────────────────┴───────────────────────────┘
```

- **Grid:** `grid-template-columns: 312px 360px 1fr`. Below 980px the editorial
  column is dropped and the rail narrows (`240px 1fr`, full-viewport width).
- **Surface theming** is driven by a `data-surface` attribute on `.mega` that
  swaps a set of `--rail-*` and `--pane-*` CSS variables (see Tweaks / Tokens).
- The panel slides in via `transform: translateX(-101% → 0)` over 760ms
  ease-out-expo; the storefront behind blurs and scales slightly; a scrim
  fades in.

### Column 1 — Ink rail (McQueen)
- Black (`--ink #0A0A0A`) full-height column, cream foreground text.
- **Head (88px):** Cormorant "Enunas" wordmark + a "Schließen" close button.
- **Nav:** one row per top-level category. Each row =
  `[ 2-digit index · LABEL · chevron ]`. Index in tabular-nums muted; label in
  League Spartan uppercase, `letter-spacing 0.26em`.
- **Active/hover state:** a 3px aubergine tick bar slides in at the far left
  (`scaleY`), a hairline underline draws in under the label (`scaleX` from
  left), the chevron fades + slides in, and the label tracks out to `0.3em`.
  Hover sets the active category (also settable by focus/click).
- **Sale** category uses an oxblood tone instead of aubergine (`data-tone="sale"`).
- **Foot:** Anmelden / Hilfe links + a bordered `DE / EUR` locale chip.

### Column 2 — Cream sub-nav (Dior + Rochas)
- Warm cream (`--cream #F5F5F0`) pane, ink text.
- **Search (88px):** magnifier icon + uppercase-tracked input, hairline under.
- **Body** (changes with the active category, crossfades on swap):
  - **Kicker:** uppercase micro-label (e.g. "Damenmode entdecken").
  - **Title:** Cormorant **italic**, 300, ~40px (e.g. *Damen*).
  - **"Alle ansehen"** link with an arrow that slides on hover.
  - **Sub-list:** hairline-divided rows; rows with deeper trees show a chevron;
    hover shifts the row right 8px and recolours to aubergine.
  - **Highlights:** a short list of editorial links in italic Cormorant, each
    with an underline that draws in on hover.

### Column 3 — Editorial imagery (Dior / Rochas)
- Cream pane, 30px padding, with two **registration corner ticks** (top-right,
  bottom-left) — a sharp editorial detail.
- A **2×2 tile grid** (`data-mode="grid"`) of campaign imagery. Tiles stagger
  in on reveal (translateY + fade). Image zooms 1.06× on hover; caption =
  uppercase kicker + Cormorant name with an underline that draws in on hover.
- **Tile 0 is a "video" tile:** a Ken-Burns slow zoom on the image, a "Video"
  status tag with a dot (top-right), and a play/pause control (bottom-left)
  that toggles the animation. In production this is a real muted autoplay
  `<video>` loop; the Ken-Burns CSS is a placeholder.
- **Hero mode** (`data-mode="hero"`): one full-width image spanning the top row
  + a 2-up thumbnail strip beneath. The 4th tile is hidden in this mode.

---

## Interactions & Behavior

- **Open / close:** the storefront "Menü" button opens; close button, scrim
  click, or `Escape` closes. A convenience "Menü öffnen" button (bottom-centre)
  re-opens in the prototype — **remove in production**, the storefront header
  button is the real trigger.
- **Category activation:** hovering, focusing, or clicking a rail row sets it
  active and swaps both the sub-nav body and the editorial tiles. The sub-nav
  body crossfades (`fadeUp`) and the tiles re-run their staggered reveal on
  every swap (keyed by a reveal counter).
- **Video tile:** play/pause toggles `data-paused`, which pauses the Ken-Burns
  animation and dims the status dot.
- **Reduced motion:** all entrance motion is decorative; honour
  `prefers-reduced-motion` in production (the prototype does not yet).
- **No real navigation, search, or data fetching** is wired — sub-links and
  "Alle ansehen" are decorative buttons. In production these are real routes /
  a typeahead search.

---

## State Management

Minimal, all local component state in the prototype:

- `activeKey` — currently highlighted top-level category (`"women"` default).
- `open` — menu open/closed.
- `revealKey` — increments on category change to re-trigger entrance animations
  (a prototype device; in production prefer keyed transitions or a small
  animation library).
- `paused` — per video tile.
- Tweaks state (`surface`, `accent`, `imagery`, `motion`) — persisted to
  localStorage via the tweaks panel. **Prototype-only**; do not ship the panel.
  `surface` / `imagery` are design-exploration choices to settle on one value;
  `accent` is already a token; `motion` maps to your motion-preference handling.

**Production data needs** (replace mock arrays in `nav-data.jsx`): the
navigation tree — for each top-level category: `label`, `title`, `kicker`,
`sub[]` (label + has-children flag), `highlights[]`, and `tiles[]` (kicker,
name, image URL, optional `video`). Field names are intended to match a real
navigation/merchandising API shape.

---

## Design Tokens

All defined in **`colors_and_type.css`** (shared design system) plus a small set
of nav-local vars at the top of **`nav-v2.css`**.

### Colour
```
--cream      #F5F5F0   cream panes (warm off-white)
--paper      #FBFBF8   lighter cream (all-cream surface rail)
--white      #FFFFFF
--ink        #0A0A0A   ink rail / primary text
--ink-2      #141414   ink-surface panes
--gray-m     #6B6B6B   muted labels, kickers
--hair       #E2E2DC   hairlines on cream
--aubergine  #370E4D   sole brand accent (active tick, hover, chevrons)
                       sale tone uses oxblood #C0476A instead
```
**Rule:** monochrome + one aubergine. No gradients in product UI (the image
overlays are functional legibility scrims, not decoration). No shadows except
the panel's single soft drop for depth over the storefront.

**Surface variants** swap rail/pane variable sets:
| `data-surface` | Rail | Panes |
|---|---|---|
| `split` *(default)* | ink black | cream |
| `cream` | light paper | cream (Dior-leaning, all-light) |
| `ink` | ink black | ink (McQueen-leaning, all-dark) |

On the ink surface, the accent is lightened via `color-mix` so it reads on black.

### Typography
| Family | Weights | Use |
|---|---|---|
| **Cormorant Garamond** | 300, 300 italic | Wordmark, sub-nav title (italic), highlights, tile names |
| **League Spartan** | 400 / 500 | Everything else — rail labels, sub-links, kickers, search, buttons |

- **Eyebrow / kicker recipe:** `9–11px · letter-spacing 0.26–0.34em · uppercase
  · muted`.
- **Rail label:** League Spartan 400, 14px, `letter-spacing 0.26em` (→0.3em on
  hover), uppercase.
- **Sub-nav title:** Cormorant **italic** 300, ~40px, line-height 0.98.
- **Tile name:** Cormorant 300, ~25px (grid) / 17px (hero thumbs).

### Spacing & shape
- 8px-ish rhythm. Rail rows 52px tall; head/search rows 88px.
- **Border radius: 0 everywhere** except the status dot (`9999px`).
- Hairlines `1px solid` (cream: `--hair`; ink: `rgba(255,255,255,0.12)`).

### Motion
- Single primary easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo); a
  secondary `cubic-bezier(0.25, 1, 0.5, 1)` for small hover recolours.
- Panel slide 760ms; sub-nav crossfade 560ms; tile stagger 120–360ms delays,
  820ms each. **Motion** tweak scales these (subtle / standard / expressive) via
  a `data-motion` attribute — the presets are defined in CSS, not inline, so the
  animation shorthand stays static (a `var()`-in-`calc()` inside `animation`
  silently fails in some engines; avoid it).
- No press-scale, no springy bounce — borders/labels ease, the panel slides.

---

## Components inventory

Prototype components (in `nav-app-v2.jsx`):

| Component | Role |
|---|---|
| `App` | Storefront stage, open/close + Escape, mounts `Mega` and the Tweaks panel |
| `Mega` | The three-column panel; owns `activeKey` + reveal keying |
| `Tile` | Editorial grid tile (image + caption) |
| `VideoTile` | Tile variant with Ken-Burns + play/pause control |
| `I` | Inline 1.5–1.6px-stroke SVG icon set (close, chevron, arrow, menu, search, bag, play, pause) |

In production, model this as: `MegaNav` (shell + open state) → `CategoryRail`
(rows) + `SubNav` (search, title, links, highlights) + `EditorialGrid`
(`Tile` / `VideoTile`). Drive all three from one `categories` data source and a
single `activeCategory` value.

---

## Assets

- **Fonts:** League Spartan, Cormorant Garamond (both SIL OFL, free for any
  use). Bundled in `fonts/`; load via the codebase's normal font pipeline. The
  prototype references them through `colors_and_type.css`.
- **Icons:** custom inline SVG set in `nav-app-v2.jsx` (`I`). Swap for the
  codebase's icon library (e.g. Lucide) — the 1.5–1.6px stroke weight matches
  Lucide closely.
- **Imagery:** five placeholder campaign JPEGs in `img/` (TRENDY, NEWIN, Test1,
  Test3, Test4). Replace with real CMS-driven campaign imagery (the Enunas
  storefront uses Cloudinary). The video tile should become a real muted
  autoplay loop.

---

## Files

```
mega_navigation/
  Mega Navigation.html   entry point — open directly in a browser, no build step
  colors_and_type.css    design tokens (SHARED SOURCE OF TRUTH)
  nav-v2.css             all nav layout, surface theming, motion
  nav-app-v2.jsx         React app — App / Mega / Tile / VideoTile + icons + Tweaks wiring
  nav-data.jsx           mock navigation tree (categories, sub-links, highlights, tiles)
  tweaks-panel.jsx       prototype tweaks panel (NOT a product feature)
  fonts/                 Cormorant Garamond + League Spartan (OFL)
  img/                   placeholder campaign imagery
```

### How to preview
Open `Mega Navigation.html` directly in a browser — no build step. React +
Babel load from the unpkg CDN. The menu opens on load; hover the rail rows to
swap categories; toggle the Tweaks panel (toolbar) to compare surfaces, accent,
imagery layout and motion.

---

## Implementation recommendations

1. **Port `colors_and_type.css` tokens first** — everything keys off them.
2. **Build the shell + three zones** as real components driven by one
   `categories` source and an `activeCategory` value; use real routes for
   sub-links.
3. **Settle the surface + imagery direction.** Pick one `data-surface`
   (`split` is the recommended default) and one `imagery` mode rather than
   shipping the toggle. Keep `accent` as a token.
4. **Replace the video tile** with a real muted autoplay `<video>` loop +
   poster; keep the play/pause affordance.
5. **Wire search** to the storefront typeahead; wire "Alle ansehen" and
   sub-links to category routes.
6. **Drop the tweaks panel and the bottom "Menü öffnen" button** — both are
   prototype-only.
7. **Accessibility:** trap focus within the open menu, return focus to the
   trigger on close (Escape already closes), add `aria-expanded` on the trigger,
   use a real `<nav>` landmark (present), give the rail rows
   `role="tab"`-like semantics or treat as a menu, honour
   `prefers-reduced-motion`, and verify aubergine-on-ink / aubergine-on-cream
   contrast meets AA (both pass for the accent; check muted greys).
8. **Responsive:** below ~980px the editorial column is dropped; design a
   full-screen mobile drill-down (rail → sub-nav as stacked panels) for small
   viewports — the prototype only narrows the grid.
