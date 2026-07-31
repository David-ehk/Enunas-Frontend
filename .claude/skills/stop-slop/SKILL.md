---
name: stop-slop
description: "Anti-AI-slop design enforcement for Enunas. Load before building, reviewing, or restyling any UI: section, hero, quote, banner, card, grid, heading, footer, landing page, .tsx component. Catches the failure modes that make generated design read as templated — centered-everything \"PowerPoint slide\" layouts, timid type scale, decorative ornament with no function, gratuitous background bands, bespoke re-implementations of existing components, and desktop-only layouts that overflow on mobile. Triggers: design, redesign, restyle, make it look better, feels bland, looks off, too plain, generic, cohesive, polish, visual, layout, typography, spacing, section."
---

# Stop Slop — Enunas

Slop is not "ugly." Slop is **default**: the arrangement you get when no decision was made. Every rule below names a specific default and the decision that replaces it.

Read this before writing the component, not after the user says it looks bland.

---

## The six failure modes

### 1. The PowerPoint slide

**Default:** eyebrow centered, headline centered, body centered, rule centered, attribution centered — everything stacked on one axis, symmetric, floating in the middle of a band.

**Why it fails:** symmetry is what you get for free. It reads as a template because it *is* one. A centered stack has no entry point for the eye and no tension.

**Decision:** break the axis. Pick one:
- Content on a hard left margin, secondary element pushed to the opposite corner (quote left / attribution right).
- Asymmetric grid — the `grid lg:grid-cols-[220px_1fr]` rail used on `app/(root)/ueber-uns/page.tsx` Mission section.
- Deliberate line breaks that create a ragged, hand-set right edge.

Centered is legitimate for **section headings inside a grid rhythm** (`Neue Arrivals` between hairlines). It is not legitimate for a standalone editorial moment.

### 2. Timid type

**Default:** the "large" text is 40–48px. It feels safe. It is invisible.

**Why it fails:** a display moment needs a scale *jump*, not an increment. 46px next to 15px body is a bigger number, not a hierarchy.

**Decision:** for a statement section, go 80–96px on desktop and let it fill the measure. Use fluid sizing so it survives mobile:

```
fontSize: 'clamp(2.5rem, 6.4vw, 6rem)'   // 40px → 82px @1280 → 96px @1920
lineHeight: 1.06                          // display type only; see §6
```

Tight leading (1.02–1.1) is correct for display type that occupies **one line per element**. The moment it wraps, that leading applies *within* the wrap and packs the lines — loosen it at the breakpoint where wrapping starts.

### 3. Ornament that carries nothing

**Default:** a little rule, a glyph, a dot, a gradient divider "to balance it."

**Why it fails:** CLAUDE.md — *no decorative elements without function*. A rule that separates two related things is doing work. A rule that just sits to the left of a name is filler, and it reads as filler.

**Decision:** every non-text mark must answer "what would be ambiguous without it?" No answer → delete it. Whitespace does the same job with no cost.

### 4. The gratuitous background band

**Default:** new section → new background colour, usually `#F5F5F0`, to "separate" it.

**Why it fails:** colour blocks are a strong signal. Spending one on every section means none of them read as significant, and stacking a band next to an already-coloured region (the purple footer, a full-bleed image) creates a stripe pattern that looks unintentional.

**Decision:** default to the page surface. Earn a band with a real reason — a genuine mode change, not "this is a different section." Generous vertical padding separates sections perfectly well.

### 5. The bespoke re-implementation

**Default:** a new section needs product cards, so you write fresh card markup inline.

**Why it fails:** it drifts. The prices format differently (`€ 50` vs `49,95€`), the brand label is a different size, hover behaviour is missing, the image has no placeholder. Three sections that should be one system become three dialects.

**Decision:** before writing a card / heading / button, grep for an existing one and use it. In this repo:
- Product card → `app/Homepage/components/PopularProductCard.tsx` (accepts `ProductCardShape`; convert via `apiProductToCardShape`)
- Section heading → the centered-with-hairlines block in `NewProducts.tsx`
- Eyebrow label → `text-[11px] uppercase tracking-[0.3em] text-enunas-gray-medium`
- Big serif display → `font-cormorant font-light`, optionally `italic`

If two sections should feel like siblings, they must share the **component**, not a copy of its CSS.

### 6. Desktop-only geometry

**Default:** style it at 1280px, ship it.

**Why it fails, concretely, in this repo:**
- `whitespace-nowrap` + a long German title (`Das könnte dir auch gefallen`) = 533px of text in a 358px column. Silent overflow.
- CSS grid items default to `min-width: auto`, so tracks **refuse to shrink below their longest word**. A 2-up footer grid computed 306px of tracks inside a 272px box at 320px wide and clipped the right column off-screen. Fix: `minmax(0, 1fr)`, and stack to one column when the labels genuinely stop fitting.
- Wide tracking (`0.26em`) is elegant at desktop column widths and eats narrow mobile columns alive.

**Decision:** fixed `px` font sizes and `whitespace-nowrap` are desktop-only assumptions. Use `clamp()`. Use `minmax(0, 1fr)`. Reduce tracking at mobile breakpoints.

---

## Verify in the browser — measure, don't eyeball

A screenshot at one width proves nothing. Drive the page and read the numbers.

```js
// overflow is the #1 silent mobile bug
document.documentElement.scrollWidth > document.documentElement.clientWidth

// per-element: does anything escape the viewport?
[...document.querySelectorAll('.foo *')]
  .filter(el => el.getBoundingClientRect().right > innerWidth + 1)

// grid track blowout: computed tracks vs the box they sit in
getComputedStyle(grid).gridTemplateColumns   // vs grid.clientWidth
grid.scrollWidth > grid.clientWidth

// is the "cohesive" claim actually true? compare computed styles, not vibes
getComputedStyle(h2).fontSize / .letterSpacing / .fontFamily
```

Check **320, 375, 390, 1280, 1920**. 320 is where grid-track blowout shows up; 1920 is where a `clamp()` cap and dead whitespace show up.

Two harness gotchas learned the hard way:
- Element screenshots scroll the target into view, so a **sticky navbar overlaps it**. That's an artifact, not a layout bug.
- Cloning a node into a comparison container renders it at a **different width**, which changes wrapping. Trust measurements taken on the live node.

---

## Before declaring it done

- [ ] Is anything centered that didn't earn it?
- [ ] Does the display type actually jump scale, or just increment?
- [ ] Can I delete a rule/glyph/divider with no loss of meaning? Then delete it.
- [ ] Did I add a background colour, and can I justify it beyond "it's a new section"?
- [ ] Does an existing component already do this? Did I grep?
- [ ] Measured at 320 / 375 / 1280 / 1920 — zero horizontal overflow at every one?
- [ ] `transform`/`opacity` only, `ease-out-expo` or `ease-out-quart`, never `linear`?
- [ ] Reduced motion handled (`useScrollAnimation` does this — reuse it)?
- [ ] `npm run build` passes?

---

## Scope discipline

Fixing slop is not licence to redesign. CLAUDE.md hard constraint #1 stands: change what was asked. If a neighbouring section has the same flaw, **say so and leave it** — unless the user's stated goal was cohesion between those sections, in which case fixing only one *breaks* the goal and the sibling change is in scope. State plainly which files you touched and why.
