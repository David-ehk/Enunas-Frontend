# Enunas Dashboards — Inspiration Pack

A hi-fi clickable prototype for two surfaces of the Enunas marketplace:

- **Admin** — the platform operator's dashboard (6 screens)
- **Brand Partner** — the vendor's dashboard (7 screens)

Open `Dashboards.html` in any modern browser. Switch roles via the
topbar pill, the round arrow button next to it, or the **Tweaks** panel.
No build step, no server — plain HTML + React via CDN.

---

## What to take, what to change

This pack is a reference, not a final design. Below is an honest list of
patterns worth lifting verbatim, patterns to revisit, and patterns that
are deliberately under-scoped.

### Lift as-is

- **Page header pattern.** Eyebrow (uppercase tracked) → big Cormorant
  title with an italic word break → italic Cormorant subtitle. Reads
  editorial without feeling decorative. See every `<PageHeader>` call.
- **KPI strip pattern.** 4 KPIs in a single bordered grid (no card
  shadows, no internal gaps), each with: small uppercase label →
  large Cormorant number → tiny delta line with arrow → optional
  sparkline. Consistent across both roles.
- **Table conventions.** Hairline rows only, no zebra stripes, no
  rounded corners. Monospace for SKUs and order IDs. Status as a small
  coloured dot + uppercase tracked label, never a filled badge.
- **Status dot vocabulary.** Six tones: `success`, `warn`, `error`,
  `purple`, `muted`, plus the implicit default. Always paired with a
  short uppercase label, never used alone.
- **Empty / placeholder treatment.** Striped diagonal pattern over
  cream with a monospace label naming what's missing — useful for
  product images, brand logos, etc.
- **Filter bar layout.** Segmented control + free-text search +
  contextual selects + a count on the right edge. One row, no wrap.
- **The single purple rule.** Purple appears only on: primary CTA,
  active nav indicator (the 2px left stripe), the active bar in
  charts, status dots that mean "in your queue". Never decorative.
- **Returns model (Brand Partner Returns view).** Customer reason
  shown as a chip, customer's own note shown as a Cormorant italic
  pull-quote in the row — humanises a data table without ornament.

### Worth revisiting

- **Cormorant for KPI numbers.** Looks beautiful, but on smaller
  viewports or for hourly traders it may read slow. The `cormorantAccents`
  tweak shows the alternative — try both for your users.
- **No card shadows.** Enunas commits hard to flat hairlines. If your
  brand allows more elevation, a `0 4px 20px rgba(0,0,0,0.06)` shadow
  on cards opens up airy depth without leaving the editorial register.
- **Sidebar collapse to icon-rail.** Currently the rail loses the
  active indicator stripe — a fix would be to keep the 2px purple bar
  even when collapsed and centre the icon over it.
- **Bar/line charts.** Hand-rolled inline SVG, no library. Fine for a
  prototype; production should swap for Recharts / Visx so axis
  formatting, tooltips, and brushing come for free.
- **Density modes.** Only row height changes today. A real "compact"
  mode would also drop type sizes, KPI value size, and card padding
  by ~15%.

### Deliberately under-scoped

- **Detail pages.** No single-order view, no product editor, no
  brand-partner profile editor. Every "Open" button is decorative.
- **Notifications panel / command palette.** Topbar surfaces the
  affordances (`⌘K`, bell icon with dot) but neither opens.
- **Auth / 2FA / org switching.** Not modelled — assumes the user is
  inside their workspace already.
- **Mobile.** Designed at 1280px+ desktop. The sidebar collapse helps
  but tables will horizontal-scroll on phones.
- **Internationalisation.** English copy only (per the questionnaire).
  Production needs DE first, then EN.

---

## File structure

```
dashboards/
├── Dashboards.html          # entry point — open this
├── colors_and_type.css      # design tokens (mirrors enunas/app/globals.css)
├── styles.css               # dashboard-specific CSS (sidebar, topbar, tables…)
├── icons.jsx                # inline stroke icons (single Icon factory + Icons map)
├── components.jsx           # shared components (Sidebar, Topbar, KPI, Card, …)
├── data.jsx                 # mock brands / products / orders / customers / payouts
├── admin-views.jsx          # 6 admin screens
├── partner-views.jsx        # 7 brand partner screens
├── app.jsx                  # routing, role switching, Tweaks wiring
└── tweaks-panel.jsx         # floating tweaks panel + control library
```

Everything is loaded as `<script type="text/babel" src="…">` from
`Dashboards.html` in dependency order. React 18 + Babel Standalone
come from unpkg.

---

## Design system reference

These are the only values the dashboard uses. If you change one,
change it in `colors_and_type.css`.

### Type

| Family | Use |
|---|---|
| **Cormorant Garamond** (Light 300, Light Italic) | Page titles · KPI numbers · card titles · italic pull-quotes |
| **League Spartan** (Light 300 / Regular 400 / Medium 500) | Everything else — body, nav, tables, eyebrows, buttons |
| **JetBrains Mono** (optional) | SKU, order ID, IBAN, VAT — anything you'd copy-paste |

Eyebrow recipe: `font-size: 9.5–11px · letter-spacing: 0.24–0.28em ·
text-transform: uppercase · color: var(--enunas-gray-medium)`.

### Colour

```
--enunas-off-white   #F5F5F0   app background (warm cream)
--enunas-white       #FFFFFF   card surfaces
--enunas-black       #0A0A0A   primary text
--enunas-gray-dark   #2D2D2D   secondary text
--enunas-gray-medium #6B6B6B   eyebrows, captions
--enunas-gray-light  #E8E8E8   ALL hairlines

--enunas-purple      #370E4D   sole brand accent
--enunas-success     #1A5A3C
--enunas-error       #8B1E3F
--enunas-warning     #7A5C1E
```

Single rule: monochrome + one purple. No gradients in product UI.

### Spacing & radii

- 8px grid: `--space-2` through `--space-32`.
- Card body padding: `18px 22px` (desktop comfortable).
- Page padding: `var(--pad-y) var(--pad-x)` driven by density mode.
- Corner radius: **0** everywhere except status dots and avatars.

### Motion

- Single easing: `cubic-bezier(0.16, 1, 0.3, 1)` — ease-out-expo.
- Durations: `100 / 200 / 300 / 500 / 800 / 1200ms` (named vars).
- No press scale, no bouncy springs. Borders ease colour; sidebar
  width animates over 400ms.

---

## Component recipes

The five most reused patterns and where to find them in the source.

### `<PageHeader>`
**File:** `components.jsx`
**Props:** `eyebrow · title · italicTitle · sub · actions`

```jsx
<PageHeader
  eyebrow="Today · 27 May 2026"
  title="Platform"
  italicTitle="overview."
  sub="Every brand, every order, every euro."
  actions={<button className="btn primary">Export</button>}
/>
```

The italicised second word gives the title editorial weight without
needing a separate decorative element. Use it consistently.

### `<KPIGrid>` + `<KPI>`
**File:** `components.jsx`

```jsx
<KPIGrid>
  <KPI label="GMV — Today" value="€42,180" delta="+18.2%"
       deltaTone="up" spark={[20,22,18,26,24,30,42]} />
  …
</KPIGrid>
```

`spark` is just an array of numbers — the inline `<Sparkline>` handles
the rest. Four KPIs is the right count for a header row; more than
that, switch to a table.

### `<Card>`
**File:** `components.jsx`
**Props:** `eyebrow · title · action · foot · flush · children`

```jsx
<Card eyebrow="Last 14 days" title="Revenue & units"
      action={<Segmented … />}>
  <LineChart … />
</Card>
```

`flush` removes body padding (use it for tables and feeds). `foot`
adds a bottom strip with a hairline divider — typical use is a
pagination row or a "view all" link.

### `<Status tone="success|warn|error|purple|muted">`
**File:** `components.jsx`

Dot-plus-label inline. The dot's colour carries the meaning; the
label always reads the same shape — uppercase tracked. Pair with
`statusTone()` and `statusLabel()` helpers in `data.jsx` so the
mapping is centralised.

### `<ReasonRow>` (returns reasons)
**File:** `components.jsx` · used in `partner-views.jsx`

A 3-column grid: label + secondary meta + horizontal bar + percent +
count. Reusable for any "distribution by category" pattern (top
products, channels, regions).

---

## Adapting this to your own dashboard

If you want to take this as a starting point but bend it to your
brand, here's the cheapest path:

1. **Swap tokens, not components.** Open `colors_and_type.css`. Change
   the seven colour vars and the two type families. Re-open
   `Dashboards.html` — everything reflows.
2. **Pick your "one colour" rule.** Find/replace `var(--enunas-purple)`
   in `styles.css` — there are about 8 places. That's your accent.
3. **Replace the page-header pattern** if your brand is louder. Drop
   the italic on `<em>` and keep the eyebrow + title + sub structure;
   the rest of the layout doesn't depend on Cormorant.
4. **Keep the KPI/table/card patterns.** They're brand-agnostic; the
   character comes from the tokens, not the markup.
5. **Replace `data.jsx`** with your real data shapes. Every view
   imports from `window`, so as long as the field names match, the
   views render.

---

## Notes from the original questionnaire

- **Audience:** German marketplace, but copy here is in English (per
  request). For DE rollout, the translations live in the storefront
  codebase already — re-use them.
- **Tone:** editorial-utility hybrid — confirmed.
- **Navigation:** left sidebar (collapsible) + topbar — confirmed.
- **Density:** comfortable as default; compact available via Tweaks.
- **Brand partner workflow modelled:** upload products · manage stock
  · see payouts · fulfill orders · returns received with reasons
  (refund handled by platform).
- **Admin workflow modelled:** approve brands · oversee orders ·
  manage catalogue · view customers · configure finance & integrations.

---

## License & credit

Prototype built on top of the Enunas design system (`enunas/app/globals.css`
+ this design system project). Fonts (League Spartan, Cormorant
Garamond) are SIL OFL — free for any use. Code is yours to adapt.
