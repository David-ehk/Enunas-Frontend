# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production (uses Turbopack)
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Architecture

### Route Structure
Uses Next.js App Router with route groups:
- `app/(root)/` - Main customer-facing routes, wrapped with `CartProvider` context
- `app/(dashboard)/` - Admin, vendor, and affiliate dashboards (separate from main layout)
- `app/(root)/(footer)/` - Static pages (legal, FAQ, policies) - German language URLs

### Product Routing Pattern
Dynamic product pages follow: `/bekleidung/[category]/[subcategory]/[slug]`
- Products are identified by slug, generated with German umlaut handling (ä→ae, ö→oe, ü→ue, ß→ss)
- See `lib/product.ts` for `generateSlug()` function and `Product` interface

### State Management
- **Cart**: `app/context/CartContext.tsx` provides `useCart()` hook with localStorage persistence
- Cart items are uniquely identified by combination of `productId + size + color`
- CartSidebar is globally available in `(root)` layout

### Styling
- **Fonts**: League Spartan (sans-serif) and Cormorant Garamond (serif) as CSS variables
  - `--font-league-spartan` and `--font-Cormorant-Garamond`
- **UI Components**: `components/ui/` contains Radix-based components using `cva` for variants
- **Utility**: `cn()` from `lib/utils.ts` for Tailwind class merging

### Key Patterns
- Constants (menu items, footer links, icons) are centralized in `app/constants/index.ts`
- Page-specific components live in `components/` subdirectories within each route
- Mobile detection via `hooks/use-mobile.ts` with 768px breakpoint

### Backend Integration
Frontend connects to a Spring Boot backend with PostgreSQL. Payment processing uses Mollie.
API integration is planned in `lib/api.ts`.
