# CSS / Layout Fix

Fix a CSS or layout issue within a strictly scoped boundary. Do NOT modify any component or file outside the specified scope.

## Scope Rule

The user will describe which component or element has the issue. You may ONLY modify files directly related to that component. If you believe a fix requires changing a parent or sibling component, explain why and ask for permission first — do not just change it.

## Enunas CSS Layering Conventions

### Z-Index Scale

| Layer | z-index | Usage |
|-------|---------|-------|
| Base content | `z-0` | Default page content |
| Elevated cards | `z-10` | Cards, dropdowns |
| Sticky elements | `z-20` | Sticky nav sections, filters |
| Sidebar overlays | `z-30` | Cart sidebar, filter sidebar |
| Navigation header | `z-40` | Main header/navbar |
| Search overlay | `z-50` | Search bar overlay |
| Modals | `z-50` | Modal dialogs |
| Toasts/Notifications | `z-[60]` | Toast messages |

### Common Pitfalls to Check First

1. **Parent `overflow: hidden/auto/scroll`** — kills `position: sticky` and creates new stacking contexts. Check every ancestor up to `<body>`.
2. **Stacking context creation** — `transform`, `opacity < 1`, `filter`, `will-change`, and `isolation: isolate` all create new stacking contexts. A `z-50` inside a stacking context with `z-10` is still behind `z-20` outside it.
3. **Fixed vs Sticky** — `position: sticky` requires a scrollable ancestor and no `overflow: hidden` parent. If sticky doesn't work, check parents before switching to fixed.
4. **Tailwind class conflicts** — If two Tailwind classes conflict, the last one in the stylesheet wins (not the last in the `className` string). When in doubt, use inline `style` as fallback.

## Process

### Step 1: Investigate with a Sub-Agent (keeps main session clean)

Before making ANY changes, spawn a Task agent (`subagent_type=Explore`) to investigate the CSS context. This prevents layout exploration from bloating the main conversation.

Give the sub-agent this task:
- Read the affected component file
- Trace the component tree upward through every parent layout/wrapper to `<body>`
- For each ancestor, report: tag/component name, file path, and any CSS properties that create stacking contexts (`position`, `z-index`, `overflow`, `transform`, `opacity`, `filter`, `will-change`, `isolation`)
- Report any Tailwind classes on ancestors that affect layout (`relative`, `absolute`, `fixed`, `sticky`, `overflow-hidden`, `overflow-auto`, `z-*`)
- Return a clear stacking context map from the component up to `<body>`

### Step 2: Diagnose

Using the sub-agent's report:
- Identify the root cause
- State it clearly to the user in 1-2 sentences before implementing

### Step 3: Implement the fix

- Only modify the scoped component. Use Tailwind classes first; if they don't work, use inline styles as fallback.
- If the fix requires changing a parent component, explain why and ask for permission first.

### Step 4: Verify

- Run `npm run build` to confirm no errors.
- Take a Playwright screenshot of the affected page. If it doesn't look right, iterate — do not report success until it actually works.

### Step 5: Report

- List only the files and lines modified. No other suggestions.
