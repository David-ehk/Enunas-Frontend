# Handoff: Enunas Admin & Brand Partner Dashboards

## Overview

Two operational dashboards for **Enunas**, an editorial-luxury × streetwear
curated fashion marketplace (German-first, EUR). The marketplace has two
internal user types, each with its own dashboard:

1. **Admin** — the platform operator. Oversees every brand, order, product,
   customer and the platform's finances.
2. **Brand Partner** — a vendor (e.g. "World's End"). Uploads products,
   manages stock, fulfils orders, receives returns, tracks payouts and runs
   marketing.

This package contains **two design directions**:

- **`admin_and_partner/`** — a single prototype with BOTH dashboards behind a
  role switcher (6 admin screens + 7 partner screens). This is the reference
  for the **Admin** dashboard and the baseline partner dashboard.
- **`brand_partner_v2/`** — a standalone, **chart-heavy** redesign of the
  Brand Partner dashboard (8 screens). This is the preferred, more advanced
  partner direction with richer data visualisation.

> If you are building the Brand Partner dashboard, use **`brand_partner_v2/`**
> as the primary reference. Use `admin_and_partner/` for the Admin dashboard.

---

## About the Design Files

The files in this bundle are **design references created in HTML/React-via-CDN**
— prototypes that demonstrate the intended look, layout and behaviour. **They
are not production code to copy directly.**

They use React 18 loaded from a CDN with in-browser Babel transpilation, inline
`<script type="text/babel">` tags, and global `window` assignment to share
components between files. This is a prototyping convention — **do not replicate
it in production.**

Your task is to **recreate these designs in the target codebase's environment**
using its established patterns, component library, and build tooling. If no
frontend environment exists yet, choose an appropriate modern stack
(recommended: **React + TypeScript + Vite**, with a charting library such as
**Recharts** or **Visx**, and CSS Modules or Tailwind for styling).

The hand-rolled inline-SVG charts in `brand_partner_v2/charts.jsx` should be
**replaced by a real charting library** in production — they exist only so the
prototype has no external dependencies. Their visual style (flat, single
accent colour, hairline gridlines, no gradients) is the spec to match.

---

## Fidelity

**High-fidelity.** These are pixel-considered mockups with final colours,
typography, spacing and interaction patterns. Recreate the UI faithfully using
the codebase's libraries. Exact tokens are listed in the **Design Tokens**
section below and defined in `colors_and_type.css`.

The data shown is **realistic mock data** (`data.jsx`, `bp-data.jsx`). Replace
with live API data of the same shape.

---

## Tech-agnostic component model

Both dashboards share one layout shell and a small set of reusable primitives.
Build these once as real components, then compose the screens.

### Layout shell
```
┌─────────────┬───────────────────────────────────────────┐
│             │  Topbar (72px): collapse btn · search ·    │
│  Sidebar    │           role pill · notifications        │
│  (240px,    ├───────────────────────────────────────────┤
│ collapses   │                                            │
│  to 64px)   │  Page (max-width 1600px, padded)           │
│             │   ├ PageHeader (eyebrow · title · sub ·    │
│  brand      │   │             actions)                   │
│  nav groups │   ├ KPIGrid (bordered, 4–6 KPI cells)      │
│  footer     │   └ content cards / tables / charts        │
│  (avatar)   │                                            │
└─────────────┴───────────────────────────────────────────┘
```

- **App container** uses CSS grid: `grid-template-columns: 240px 1fr`.
  Collapsed state sets the first column to `64px`. The transition animates
  `grid-template-columns` over 400ms `cubic-bezier(0.16,1,0.3,1)`.
- **Density** is a data-attribute (`data-density="comfortable|compact"`) that
  changes `--row-h`, `--pad-y`, `--pad-x` CSS variables.

---

## Screens / Views

### ADMIN (in `admin_and_partner/`, see `admin-views.jsx`)

#### 1. Overview
- **Purpose:** Platform-wide pulse for today.
- **Layout:** PageHeader → KPIGrid (4) → 2-1 grid (GMV bar chart | activity
  feed) → 2-1 grid (recent orders table | top brands list).
- **KPIs:** GMV Today (€42,180), Orders Today (184), Active Brands (42),
  Returns Pending (6) — each with delta + sparkline.
- **Components:** `BarChart` (14-day GMV), `feed` activity list with coloured
  dots, orders table, ranked top-brands list with Cormorant GMV numbers.

#### 2. Orders
- **Purpose:** Every transaction across all brands.
- **Layout:** PageHeader → filter bar (segmented status filter + search +
  brand select + count) → full-width orders table.
- **Table columns:** Order # (mono), Customer (avatar + email), Brand, Payment
  (chip), Items (num), Total (num), Status (dot), Placed, action.
- **Status values:** preparing (warn), shipped/delivered (success), returned
  (error), cancelled (muted).

#### 3. Products / Catalogue
- **Purpose:** Every SKU across the marketplace; approve / hide / re-tag.
- **Layout:** PageHeader (with Table/Grid toggle) → filter bar → table OR
  product-card grid.
- **Table columns:** Product (thumb + name + catalogue), SKU (mono), Brand,
  Catalogue (chip), Price, Stock, Status, action.

#### 4. Brand Partners
- **Purpose:** The vendor roster; approve applications, pause brands.
- **Layout:** PageHeader → KPIGrid (4) → filter bar → brands table sorted by
  GMV desc.
- **Table columns:** Brand (initial avatar + slug), Country, Products, GMV
  (30d), Joined, Status (active/pending/paused), actions.

#### 5. Customers
- **Purpose:** Customer base with retention focus.
- **Layout:** PageHeader → KPIGrid (Total, Avg LTV, Repeat rate, Segments) →
  filter bar (segment) → customers table.
- **Table columns:** Customer (avatar, purple if VIP), ID (mono), City, Orders,
  LTV, Last order, Segment (chip), action.
- **Note:** The section groups Total Customers + Avg LTV + Repeat Rate as a
  *retention* read. The brief explicitly framed these as "does the customer come
  back next month?" — consider adding Active (30d), Churn, and Time-to-2nd-order.

#### 6. Settings & Finance
- **Purpose:** Commission, payouts, taxation, team, integrations.
- **Layout:** PageHeader → tab segmented control (Finance / Commerce / Team /
  Integrations) → tab content.
  - **Finance:** definition list (commission 10%, processing, payout schedule,
    reserve, currency, VAT) + approvals queue feed.
  - **Commerce:** definition list of marketplace rules.
  - **Team:** members table with role chips + 2FA status.
  - **Integrations:** 2-col grid of integration cards each with a toggle.

### BRAND PARTNER — preferred v2 (in `brand_partner_v2/`)

> See `bp-views-1.jsx` (Overview, Orders, Products, Analytics) and
> `bp-views-2.jsx` (Returns, Payouts, Marketing, Profile).

#### 1. Overview (`BPOverview`)
- **Purpose:** The partner's month at a glance.
- **Layout:** PageHeader → KPIGrid (**6**: Revenue MTD, Open orders, Inventory
  value, Next payout, Return rate, Conversion) → 2-1 grid (revenue `AreaChart`
  with previous-period compare line | **`GaugeArc` payout-vs-revenue** showing
  net-payout share) → 3-col grid (`DonutMulti` sales by category | "Needs a
  hand" action feed spanning 2 cols).
- **Key element:** The **payout-vs-revenue gauge** (83%) — the brief
  specifically asked for "their payout relative to their revenue."

#### 2. Orders & Fulfilment (`BPOrders`)
- **Layout:** PageHeader → KPIGrid (To ship, In transit, Avg fulfilment,
  On-time rate) → 2-1 grid (**`Funnel`** order flow Placed→Delivered |
  **`Heatmap`** orders by weekday × time block) → filter bar → orders table
  with contextual action buttons (Print label / Track / Return slip).
- **Returns model copy:** Enunas handles the customer + refund; the parcel
  routes back to the brand's atelier.

#### 3. Products & Inventory (`BPProducts`)
- **Layout:** PageHeader (Table/Grid toggle) → KPIGrid (SKUs live, Units in
  stock, Inventory value, Low/out) → 2-col grid (**inventory health bars** with
  a reorder-threshold tick mark | **`StackedBar`** revenue mix by category over
  6 months) → filter bar → product table (with per-row trend sparkline) OR grid.

#### 4. Analytics (`BPAnalytics`)
- **The chart-heaviest screen.**
- **Layout:** PageHeader → KPIGrid (Sessions, Add-to-cart, Conversion, AOV) →
  2-1 grid (**`ComboChart`** sessions bars + conversion line, dual axis |
  **`Funnel`** storefront→purchase) → 3-col grid (**`HBar`** top products |
  **`HBar`** channels | geography table).

#### 5. Returns (`BPReturns`)
- **Layout:** PageHeader → KPIGrid (Returns, Return rate, Refunded value,
  Restocked %) → 2-col grid (**`AreaChart`** return-rate trend 6mo | returns by
  reason `ReasonRow` bars) → inbound-returns table with **customer notes shown
  as Cormorant italic pull-quotes**.

#### 6. Marketing & Promotions (`BPMarketing`)
- **Layout:** PageHeader → KPIGrid (Campaign revenue, Ad spend, Blended ROAS,
  Promo-driven %) → 2-1 grid (**`ComboChart`** spend bars + revenue line | hero
  slot card with image placeholder + impressions/CTR/revenue) → campaigns table
  (ROAS, CTR, status) → promo-codes table (redemptions with mini progress bar).

#### 7. Payouts & Finance (`BPPayouts`)
- **Layout:** PageHeader → KPIGrid (Next payout, Gross MTD, Effective take-home
  %, YTD earnings) → 2-1 grid (**`WaterfallChart`** Gross → −Platform 10% →
  −Processing → −Refunds → Net payout | **`GaugeArc`** earnings vs €100K goal) →
  statements table (Gross / Fee / Refunds / Net / status / PDF).

#### 8. Brand Profile (`BPProfile`)
- **Layout:** PageHeader → 2-col grid (brand identity card with logo slot +
  definition list | operations definition list with toggles) → 2-col grid
  (catalogue visibility | account danger-zone).
- Mostly forms/definition lists — minimal charting.

---

## Interactions & Behavior

- **Sidebar nav:** click an item → sets active page (client-side routing).
  Active item shows a 2px purple left-stripe + filled cream background +
  medium weight. In production use real routes (`/admin/orders`,
  `/partner/payouts`, …).
- **Sidebar collapse:** topbar button toggles collapsed state; labels, badges
  and section headers hide, icons centre, brand shrinks to "E". Grid column
  animates 400ms ease-out-expo.
- **Role switcher** (only in `admin_and_partner/`): topbar pill / arrow button
  flips between Admin and Partner; resets page to Overview. In production these
  are two separate authenticated areas, not a toggle.
- **Segmented controls** (status filters, tabs, Table/Grid): set local state,
  filter the rendered rows. `aria-pressed` marks the active segment.
- **Tables:** row hover = cream background (160ms). No row selection logic is
  wired beyond checkboxes in the partner orders table.
- **Density toggle:** comfortable ↔ compact changes row height (48→36px) and
  page padding.
- **Charts:** static render from data arrays. Production charts should add
  tooltips on hover and animate-in on mount (the prototype funnel/bars use a
  600ms width transition).
- **No real data fetching, auth, or mutations** are implemented — all actions
  (Edit, Open, Ship, Approve) are decorative buttons.

---

## State Management

Minimal, all local component state in the prototype:

- `page` — current active screen id (lift to router in production).
- `role` — `"admin" | "partner"` (prototype only; real app uses auth/roles).
- Per-screen filter state: `filter` (status segment), `view` (table/grid),
  `tab` (settings sub-tab).
- Tweaks state (`collapsed`, `density`, `cormorantAccents`) — persisted to
  localStorage in the prototype via the tweaks panel; in production map
  `collapsed`/`density` to a user-preferences store and drop `cormorantAccents`
  (that's a design-exploration toggle, not a product feature).

**Production data needs** (replace mock arrays in `data.jsx` / `bp-data.jsx`):
orders, products, brands, customers, payouts, return reasons, campaigns, promo
codes, and the time-series arrays feeding each chart. Field names in the mock
data are intended to match a real API response shape.

---

## Design Tokens

All defined in **`colors_and_type.css`** (the single source of truth).

### Colour
```
--enunas-off-white   #F5F5F0   app background (warm cream)
--enunas-white       #FFFFFF   card surfaces
--enunas-black       #0A0A0A   primary text
--enunas-gray-dark   #2D2D2D   secondary text
--enunas-gray-medium #6B6B6B   eyebrows, captions, axis labels
--enunas-gray-light  #E8E8E8   ALL hairlines + chart "rest" bars

--enunas-purple      #370E4D   sole brand accent (CTAs, active nav, charts)
--enunas-success     #1A5A3C   shipped/delivered/active/paid/in-stock
--enunas-error       #8B1E3F   returned/out-of-stock/deductions
--enunas-warning     #7A5C1E   preparing/low-stock/pending
```
**Rule:** monochrome + one purple. No gradients in product UI. Chart
secondary tints derive from purple: `#9B7BB5`, `#C9B8D6`.

### Typography
| Family | Weights | Use |
|---|---|---|
| **Cormorant Garamond** | 300, 300 italic | Page titles, KPI numbers, card titles, pull-quotes |
| **League Spartan** | 300 / 400 / 500 | Everything else — body, nav, tables, eyebrows, buttons |
| **JetBrains Mono** (or any mono) | 400 | SKUs, order IDs, IBAN, VAT, chart value labels |

- **Eyebrow recipe:** `9.5–11px · letter-spacing 0.24–0.28em · uppercase ·
  color gray-medium`.
- **Page title:** Cormorant 300, ~44px, line-height 1.05; second word often
  italicised via `<em>`.
- **KPI value:** Cormorant 300, ~38px.
- Body text: League Spartan, 12.5–13px, line-height 1.5.
- Button text: 11px, letter-spacing 0.2em, uppercase.

### Spacing & shape
- 8px grid. Card body padding `18px 22px`. Page padding driven by density.
- **Border radius: 0 everywhere** except status dots and avatars (`9999px`).
- Card / table / KPI borders: `1px solid --enunas-gray-light`. **No shadows.**

### Motion
- Single easing for everything: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo).
- Durations: 100 / 200 / 300 / 400 / 600ms. No press-scale, no springy bounce.
  Borders ease colour on hover; sidebar width animates.

---

## Components inventory

Reusable primitives (in `components.jsx`, shared by both directions):

| Component | Props | Notes |
|---|---|---|
| `Sidebar` | role, items, current, onNavigate | Grouped nav, collapsible, footer avatar |
| `Topbar` | role, collapsed, onToggleSidebar, onSwitchRole, searchPlaceholder | 72px sticky |
| `PageHeader` | eyebrow, title, italicTitle, sub, actions | Editorial header pattern |
| `KPIGrid` / `KPI` | label, value, unit, delta, deltaTone, spark | Bordered grid; spark = number[] |
| `Sparkline` | data, tone | Tiny inline SVG line |
| `Card` | eyebrow, title, action, foot, flush | `flush` removes body padding (tables) |
| `Status` | tone, children | Coloured dot + uppercase label |
| `Chip` | tone | ghost / purple / dark / default |
| `Avatar` | name, purple | Initials |
| `Segmented` | value, onChange, options | Filter/tab control |
| `Toggle` | on, onChange | Switch |
| `BarChart`, `LineChart`, `Donut` | — | Baseline charts |
| `ReasonRow` | label, count, total, meta | Distribution bar row |
| `PhImg` | label | Striped placeholder for images |

Chart vocabulary added in v2 (`charts.jsx`) — **replace with a chart library in
production, match the visual style:**

| Component | Use |
|---|---|
| `AreaChart` | Filled line + optional dashed compare line |
| `ComboChart` | Bars + overlaid line, dual Y-axis |
| `WaterfallChart` | Payout breakdown (base / subtract / total bars) |
| `Funnel` | Vertical conversion/fulfilment funnel with step % |
| `HBar` | Horizontal ranking bars |
| `StackedBar` | Categories over time |
| `Heatmap` | Weekday × time-block intensity grid |
| `GaugeArc` | Semicircular ratio gauge (payout share, goal progress) |
| `DonutMulti` | Multi-segment donut with legend |
| `InventoryBar` | Stock level vs reorder-threshold tick |

---

## Assets

- **Fonts:** League Spartan, Cormorant Garamond (both SIL OFL, free for any
  use). JetBrains Mono for monospace (OFL). Load via the codebase's normal font
  pipeline; the prototype references them through `colors_and_type.css`.
- **Icons:** custom 1.6px-stroke inline SVG set in `icons.jsx` (Dashboard,
  Orders, Box, Tag, Users, Partners, Settings, Wallet, Chart, Truck, Return,
  Profile, Search, Bell, etc.). Swap for the codebase's icon library (e.g.
  Lucide) — the visual weight matches Lucide closely.
- **Product / brand images:** all shown as striped `PhImg` placeholders. Wire to
  real image URLs (the Enunas storefront uses Cloudinary).
- **No raster assets** are bundled — everything is CSS/SVG.

---

## Files

### `admin_and_partner/` — Admin dashboard + baseline partner (role toggle)
```
Dashboards.html       entry point
colors_and_type.css   design tokens (SOURCE OF TRUTH)
styles.css            dashboard CSS (sidebar, topbar, tables, KPI, charts…)
icons.jsx             inline icon set
components.jsx        shared primitives
data.jsx              mock data + money/status helpers
admin-views.jsx       6 admin screens
partner-views.jsx     7 baseline partner screens
app.jsx               routing + role switch + tweaks wiring
tweaks-panel.jsx      prototype tweaks panel (NOT a product feature)
```

### `brand_partner_v2/` — preferred chart-heavy Brand Partner dashboard
```
Brand Partner Dashboard.html   entry point
colors_and_type.css            design tokens (identical to admin)
styles.css                     dashboard CSS (identical base)
icons.jsx                      inline icon set
components.jsx                 shared primitives
charts.jsx                     RICH chart vocabulary (replace w/ chart lib)
data.jsx                       base mock data + helpers
bp-data.jsx                    partner-specific data + chart time-series
bp-views-1.jsx                 Overview, Orders, Products, Analytics
bp-views-2.jsx                 Returns, Payouts, Marketing, Profile
bp-app.jsx                     routing + tweaks wiring
tweaks-panel.jsx               prototype tweaks panel (NOT a product feature)
```

### How to preview the prototypes
Open either `.html` file directly in a browser — no build step. React + Babel
load from unpkg CDN. Switch screens via the sidebar; in the admin bundle switch
roles via the topbar pill or the Tweaks panel.

---

## Implementation recommendations

1. **Start with the layout shell + token file.** Port `colors_and_type.css`
   variables into your styling system first; everything keys off them.
2. **Build the primitives** (`PageHeader`, `KPI`/`KPIGrid`, `Card`, `Status`,
   `Chip`, table styles, `Sidebar`, `Topbar`) as real components.
3. **Replace charts with Recharts/Visx**, matching the flat single-accent style
   (purple series, `#E8E8E8` rests, dashed hairline gridlines, mono value
   labels, no gradients). The custom components in `charts.jsx` document the
   exact intended output.
4. **Wire routing** instead of the `page` state; protect Admin vs Partner areas
   by role.
5. **Replace mock data** with API calls; keep the field shapes.
6. **Drop the tweaks panel and `cormorantAccents` toggle** — prototype-only.
   Keep `collapsed` and `density` as genuine user preferences if desired.
7. **Accessibility:** add focus-visible rings, real `<nav>`/`<main>` landmarks
   (already roughly present), `aria-current` on active nav (present), table
   `<caption>`/scope, and ensure the purple/cream contrast meets AA for text
   (purple on white passes; check status colours on cream).
```
```
