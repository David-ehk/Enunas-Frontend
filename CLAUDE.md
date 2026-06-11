# ENUNAS - Project Guidelines for Claude

## Hard Constraints

These rules are absolute. Follow them on every task without exception.

1. **Only modify what was explicitly requested.** Do NOT make unsolicited changes to existing components, styles, or structure. If you notice something else that could be improved, mention it but do not change it.
2. **Implement fixes directly.** Do not stop at planning or diagnosis unless explicitly asked to plan only. Always verify the fix works before reporting success.
3. **Run `npm run build` after TypeScript changes** to verify no type errors were introduced. Do not report a fix as complete until the build passes.
4. **Product routes use 2 levels** (`/bekleidung/[category]/[slug]`), not 3. Product slugs must be consistent across all data sources — check both homepage and product page data files when modifying routing.
5. **CSS/Layout debugging:** When fixing z-index, sticky/fixed positioning, or overlay issues, always check parent element `overflow` and stacking context. If Tailwind classes don't work on first attempt, use inline styles as fallback.
6. **No unsolicited refactoring.** A bug fix doesn't need surrounding code cleaned up. Don't add docstrings, comments, or type annotations to code you didn't change.

---

## Checklist

Before generating any code, verify:

- [ ] Uses the Enunas color scheme (`#FFFFFF`, `#370E4D`, `#F5F5F0`)
- [ ] Animations use `ease-out-expo` or `ease-out-quart` (never `linear`)
- [ ] Typography uses League Spartan and Cormorant Garamond
- [ ] Hover states are implemented with smooth transitions
- [ ] Layout uses generous whitespace
- [ ] Mobile-first responsive design (768px breakpoint)
- [ ] `prefers-reduced-motion` is respected
- [ ] Performance: Only animate `transform` and `opacity`
- [ ] No "AI-slop" design (no generic gradients, no cookie-cutter layouts)
- [ ] Components follow established patterns from `components/ui/`
- [ ] Utility classes use `cn()` from `lib/utils.ts`

---

## What to Avoid

### Generic AI Aesthetic
- No purple gradients on white background
- No overused fonts like Inter, Roboto, Arial
- No predictable, cookie-cutter layouts
- No generic icon sets

### Excessive Decoration
- No unnecessary box-shadows or glow effects
- No overloaded borders or ornaments
- No decorative elements without function — less is more

### Abrupt Animations
- No `linear` timing functions
- No animations too fast (<100ms) or too slow (>1500ms)
- No "bouncy" or "springy" effects
- No `ease-in` for UI elements (feels sluggish)

### Poor Performance
- No layout-animating properties (`width`, `height`, `top`, `left`, `margin`, `padding`, `border-width`, `font-size`)
- No unoptimized images — always use Next.js `<Image>` with WebP/AVIF, blur placeholder, responsive `sizes`, and `priority` for above-the-fold
- No blocking render resources
- No excessive re-renders

### Accessibility Violations
- No animations without `prefers-reduced-motion` fallback
- No low contrast ratios
- No missing focus states

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router) with TypeScript and Tailwind CSS v4 |
| **Backend** | Spring Boot (Java) |
| **Database** | PostgreSQL |
| **Payment** | Mollie |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | AWS EC2 |
| **Assets/Images** | AWS S3 |

### Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production (uses Turbopack)
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## Project Directory Structure

```
enunas/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── admin/
│   │       ├── afiliates/
│   │       └── vendor/
│   ├── (root)/
│   │   ├── (footer)/
│   │   │   ├── agbs/
│   │   │   ├── cookie-einstellungen/
│   │   │   ├── cookie-richtlinien/
│   │   │   ├── datenschutzerklärung/
│   │   │   ├── faqs/
│   │   │   ├── Impressum/
│   │   │   ├── karriere/
│   │   │   ├── kundenservice/
│   │   │   ├── lieferung-&-rücksendung/
│   │   │   ├── nutzungsbedingungen/
│   │   │   └── sendungsverfolgung/
│   │   ├── about us/
│   │   ├── account/
│   │   ├── bekleidung/
│   │   │   ├── [category]/
│   │   │   │   └── [subcategory]/
│   │   │   │       └── [slug]/
│   │   │   │           └── components/
│   │   │   └── components/
│   │   ├── cart/
│   │   │   └── components/
│   │   ├── catalogue/
│   │   │   └── components/
│   │   ├── drop/
│   │   │   └── components/
│   │   ├── marken/
│   │   │   └── components/
│   │   ├── mystery/
│   │   ├── neu/
│   │   │   └── components/
│   │   ├── saved-lists/
│   │   ├── trendy/
│   │   │   └── components/
│   │   └── layout.tsx
│   ├── Homepage/
│   │   └── components/
│   ├── constants/
│   ├── context/
│   ├── fonts/
│   └── layout.tsx
├── components/
│   └── ui/
├── lib/
│   └── api/
│       ├── index.ts      # Shared fetch wrapper, error handling, auth headers
│       ├── products.ts   # Product catalog, search, filters
│       ├── cart.ts       # Cart operations (server-side sync)
│       ├── orders.ts     # Order creation, history, tracking
│       ├── auth.ts       # Login, register, password reset
│       └── payments.ts   # Mollie payment integration
├── hooks/
│   └── use-mobile.ts     # Mobile detection (768px breakpoint)
├── public/
│   └── assets/
│       ├── icons/
│       ├── images/
│       └── Videos/
├── CLAUDE.md
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## Architecture

### Route Structure

Next.js App Router with Route Groups:

| Route Group | Description |
|-------------|-------------|
| `app/(root)/` | Main customer routes, wrapped with `CartProvider` Context |
| `app/(dashboard)/` | Admin, Vendor and Affiliate Dashboards (separate layout) |
| `app/(root)/(footer)/` | Static pages (Legal, FAQ, Policies) — German URLs |

### Product Routing Pattern

Dynamic product pages: `/bekleidung/[category]/[slug]`

- Products are identified by slug
- Umlaut handling: ä→ae, ö→oe, ü→ue, ß→ss
- See `lib/product.ts` for `generateSlug()` and `Product` interface

### State Management

- **Cart Context**: `app/context/CartContext.tsx` → `useCart()` hook with localStorage persistence
- Cart Items: Unique ID = `productId + size + color`
- CartSidebar is globally available in `(root)` layout

### Key Patterns

- Constants centralized in `app/constants/index.ts`
- Page-specific components in `components/` subdirectories per route
- Mobile detection via `hooks/use-mobile.ts` (768px breakpoint)
- API URL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:8080/api/v1`)

---

## API Contract

Base URL: `http://localhost:8080` (dev — Spring root context, kein `/api`-Prefix). Single source of truth: `NEXT_PUBLIC_API_URL` in `.env.local`; Fallback in `lib/api/fetcher.ts`.

All protected routes require: `Authorization: Bearer <token>` — handled automatically by `lib/api/fetcher.ts` when `auth: true` (default). Token + role returned by `POST /auth/login`.

---

### Auth (Public)

| Method | Path | Body | Response | Notes |
|--------|------|------|----------|-------|
| `POST` | `/auth/signup` | `RegisterUserDto` | `UserResponseDto` | Creates CUSTOMER, immediately enabled |
| `POST` | `/auth/login` | `LoginUserDto` | `LoginResponseDto` (`token`, `expiresIn`) | JWT, 24 h expiry |

---

### User (Authenticated)

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/users/me` | `UserResponseDto` |
| `GET` | `/users` | `List<UserResponseDto>` — ADMIN only |

---

### Customer (CUSTOMER)

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/customer/me` | — | `CustomerResponseDto` |
| `PATCH` | `/customer/me` | `UpdateCustomerProfileDto` | `CustomerResponseDto` |

---

### Brand Partner (mixed auth)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `POST` | `/brandpartner/apply` | Public | `RegisterBrandPartnerDto` | `BrandPartnerResponseDto` |
| `POST` | `/brandpartner/verify` | Public | `VerifyUserDto` | `String` |
| `POST` | `/brandpartner/resend-verification?email=` | Public | — | `String` |
| `GET` | `/brandpartner/me` | BRAND_PARTNER | — | `BrandPartnerResponseDto` |
| `PATCH` | `/brandpartner/me` | BRAND_PARTNER | `UpdateBrandPartnerDto` | `BrandPartnerResponseDto` |
| `GET` | `/brandpartner/{id}` | Authenticated | — | `BrandPartnerResponseDto` |

---

### Products (CUSTOMER / BRAND_PARTNER)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `POST` | `/products/create` | BRAND_PARTNER | `CreateProductDto` | `ProductResponseDto` |
| `GET` | `/products/{id}` | Both | — | `ProductResponseDto` |
| `GET` | `/products/sku/{sku}` | Both | — | `ProductResponseDto` |
| `GET` | `/products?page=&size=20` | Both | — | `Page<ProductResponseDto>` |
| `GET` | `/products/search?keyword=` | Both | — | `Page<ProductResponseDto>` |
| `GET` | `/products/category/{category}` | Both | — | `Page<ProductResponseDto>` |
| `GET` | `/products/my` | BRAND_PARTNER | — | `List<ProductResponseDto>` |
| `PUT` | `/products/update/{id}` | BRAND_PARTNER | `UpdateProductDto` | `ProductResponseDto` |
| `DELETE` | `/products/delete/{id}` | BRAND_PARTNER | — | 204 |

---

### Product Listings

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `POST` | `/products/{productId}/listings` | BRAND_PARTNER | `CreateListingDto` | `ListingResponseDto` |
| `GET` | `/products/{productId}/listings` | Both | — | `List<ListingResponseDto>` |
| `GET` | `/listings/{listingId}` | Both | — | `ListingResponseDto` |
| `GET` | `/listings?region=` | Both | — | `List<ListingResponseDto>` |
| `PUT` | `/products/{productId}/listings/{listingId}` | BRAND_PARTNER | `UpdateListingDto` | `ListingResponseDto` |
| `DELETE` | `/products/{productId}/listings/{listingId}` | BRAND_PARTNER | — | 204 |

---

### Product Variants

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `POST` | `/products/{productId}/variants` | BRAND_PARTNER | `ProductVariantDto` | `ProductVariantResponseDto` |
| `GET` | `/products/{productId}/variants` | Both | — | `List<ProductVariantResponseDto>` |
| `PUT` | `/products/{productId}/variants/{variantId}` | BRAND_PARTNER | `UpdateProductVariantDto` | `ProductVariantResponseDto` |
| `DELETE` | `/products/{productId}/variants/{variantId}` | BRAND_PARTNER | — | 204 |

---

### Product Media

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| `POST` | `/products/{productId}/media/images` | BRAND_PARTNER | `ProductImageDto` | `ProductImageResponseDto` |
| `GET` | `/products/{productId}/media/images` | Both | — | `List<ProductImageResponseDto>` |
| `DELETE` | `/products/{productId}/media/images/{imageId}` | BRAND_PARTNER | — | 204 |
| `POST` | `/products/{productId}/media/videos` | BRAND_PARTNER | `ProductVideoDto` | `ProductVideoResponseDto` |
| `GET` | `/products/{productId}/media/videos` | Both | — | `List<ProductVideoResponseDto>` |
| `DELETE` | `/products/{productId}/media/videos/{videoId}` | BRAND_PARTNER | — | 204 |

---

### Customer Orders (CUSTOMER)

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/orders` | `CreateOrderDto` | `OrderResponseDto` |
| `GET` | `/orders/me?page=&size=10` | — | `Page<OrderResponseDto>` |
| `GET` | `/orders/{orderId}` | — | `OrderResponseDto` |
| `POST` | `/orders/{orderId}/return` | `ReturnRequestDto` | `OrderResponseDto` |

---

### Brand Orders (BRAND_PARTNER)

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/brand/orders?page=&size=20` | — | `Page<OrderResponseDto>` |
| `POST` | `/brand/orders/{orderId}/ship` | `ShipmentConfirmationDto` | `OrderResponseDto` |
| `POST` | `/brand/orders/{orderId}/problem` | `ShippingProblemDto` | `OrderResponseDto` |

---

### Wardrobe (CUSTOMER)

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/wardrobe` | `AddToWardrobeDto` | `WardrobeItemResponseDto` |
| `GET` | `/wardrobe` | — | `List<WardrobeItemResponseDto>` |
| `DELETE` | `/wardrobe/{id}` | — | 204 |

---

### Admin — Brands (ADMIN)

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/admin/brands?page=&size=50` | — | `Page<BrandPartnerResponseDto>` |
| `POST` | `/admin/brands/{brandId}/approve` | — | `BrandPartnerResponseDto` |
| `POST` | `/admin/brands/{brandId}/reject` | — | `BrandPartnerResponseDto` |
| `POST` | `/admin/brands/{brandId}/suspend` | — | `BrandPartnerResponseDto` |
| `PATCH` | `/admin/brands/{brandId}/payout-profile` | `SetPayoutProfileDto` | `BrandPartnerResponseDto` |

---

### Admin — Products (ADMIN)

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/admin/products?page=&size=50` | — | `Page<AdminProductResponseDto>` |
| `PATCH` | `/admin/products/{productId}` | `UpdateProductDto` | `AdminProductResponseDto` |
| `DELETE` | `/admin/products/{productId}` | — | 204 |
| `POST` | `/admin/products/{productId}/approve` | — | `AdminProductResponseDto` |
| `POST` | `/admin/products/{productId}/reject` | `RejectionDto` | `AdminProductResponseDto` |
| `POST` | `/admin/products/{productId}/hide` | — | `AdminProductResponseDto` |

---

### Admin — Customers (ADMIN)

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/admin/customers?page=&size=50` | — | `Page<CustomerResponseDto>` |
| `GET` | `/admin/customers/{id}` | — | `CustomerResponseDto` |
| `PATCH` | `/admin/customers/{id}` | `UpdateCustomerProfileDto` | `CustomerResponseDto` |

---

### Admin — Orders (ADMIN)

| Method | Path | Body | Response |
|--------|------|------|----------|
| `GET` | `/admin/orders?page=&size=50` | — | `Page<OrderResponseDto>` |
| `GET` | `/admin/orders/{orderId}` | — | `OrderResponseDto` |
| `GET` | `/admin/orders/status/{status}` | — | `Page<OrderResponseDto>` |
| `PATCH` | `/admin/orders/{orderId}/status?status=` | — | `OrderResponseDto` |
| `POST` | `/admin/orders/{orderId}/cancel` | `CancelOrderDto` | `OrderResponseDto` |
| `POST` | `/admin/orders/{orderId}/return/approve` | — | `OrderResponseDto` |
| `POST` | `/admin/orders/{orderId}/return/receive` | — | `OrderResponseDto` |
| `POST` | `/admin/orders/{orderId}/return/refund?refundAmount=` | — | `OrderResponseDto` |

---

### Admin — Payouts (ADMIN)

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/admin/payouts/generate` | — | `List<PayoutResponseDto>` |
| `GET` | `/admin/payouts/dashboard` | — | `PayoutDashboardDto` |
| `GET` | `/admin/payouts?status=&page=&size=50` | — | `Page<PayoutResponseDto>` |
| `GET` | `/admin/payouts/{payoutId}` | — | `PayoutResponseDto` |
| `POST` | `/admin/payouts/{payoutId}/approve` | — | `PayoutResponseDto` |
| `POST` | `/admin/payouts/{payoutId}/paid` | `MarkAsPaidDto` | `PayoutResponseDto` |
| `POST` | `/admin/payouts/{payoutId}/cancel` | — | `PayoutResponseDto` |

---

### Admin — Reconciliation (ADMIN)

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/admin/reconciliation` | `List<DriftReport>` |
| `GET` | `/admin/reconciliation/{brandId}` | `DriftReport` |
| `POST` | `/admin/reconciliation/{brandId}/rebuild` | `DriftReport` |

---

## Design System

### Color Usage

| Element | Color | Hex |
|---------|-------|-----|
| **Primary Backgrounds** | `--enunas-white` | `#FFFFFF` |
| **Secondary Backgrounds** | `--enunas-off-white` | `#F5F5F0` |
| **CTAs, Links, Focus** | `--enunas-purple` | `#370E4D` |
| **Hover States** | `--enunas-purple-light` | `#4A1566` |
| **Pressed States** | `--enunas-purple-dark` | `#250838` |
| **Subtle Backgrounds** | `--enunas-purple-muted` | `rgba(55, 14, 77, 0.1)` |
| **Headlines & Body** | `--enunas-black` | `#0A0A0A` |
| **Secondary Text** | `--enunas-gray-dark` | `#2D2D2D` |
| **Tertiary Text, Icons** | `--enunas-gray-medium` | `#6B6B6B` |
| **Borders & Dividers** | `--enunas-gray-light` | `#E8E8E8` |
| **Success** | `--enunas-success` | `#1A5A3C` |
| **Error** | `--enunas-error` | `#8B1E3F` |
| **Warning** | `--enunas-warning` | `#7A5C1E` |

### Typography

| Application | Font | Properties |
|-------------|------|------------|
| **Headlines** | League Spartan | Bold/Semibold, Uppercase for impact |
| **Subheadlines** | Cormorant Garamond | Medium, Elegant |
| **Body Text** | League Spartan | Regular, Line-Height 1.6-1.7 |
| **Accents/Labels** | League Spartan | Uppercase, Letter-Spacing 0.1em-0.15em |
| **Prices/Numbers** | League Spartan | Tabular numbers when available |

Type scale, spacing scale, and container widths are defined in `app/globals.css` under `:root`.

---

## UI/UX Philosophy

Inspired by **Alexander McQueen** (dramatic elegance) and **Moncler** (fluid motion design).

1. **Product & Content as Hero** — Restrained layouts with precision. Enhance content, never distract. Generous whitespace as a deliberate design element.
2. **Fluid Motion Design** — Smooth, elegant transitions. Seamless page-to-page flow. Motion that effortlessly guides.
3. **Dramatic Elegance** — Bold yet refined. Immersive visual exploration. Storytelling through design.
4. **Restrained Typography** — Clean, minimal interface. Typography with craft and precision. No superfluous decorations.

---

## Animations

All animation keyframes, utility classes, hover effects, and micro-interactions are defined in `app/globals.css`. Read that file for implementation details.

### Available CSS Classes

| Class | Use For |
|-------|---------|
| `.animate-fade-in-up` | Text blocks, headings — translates up 30px with fade |
| `.animate-fade-in-scale` | Images, cards — scales from 95% with fade |
| `.animate-fade-in` | Subtle opacity reveals |
| `.stagger-container` | Wrap grid/list items for sequential 100ms-delay reveal |
| `.scroll-hidden` / `.scroll-visible` | Scroll-triggered reveals (use with Intersection Observer) |
| `.stagger-delay-1` to `.stagger-delay-4` | Scroll-triggered stagger delays |
| `.parallax-element` | Subtle parallax (max 20% offset via JS) |
| `.product-image-container` + `.product-image` | Product image 1.05x scale on hover |
| `.btn-primary` | Button with white reveal-up hover effect (wrap text in `<span>`) |
| `.link-animated` | Link with underline that scales left-to-right on hover |
| `.favorite-btn` | Favorite icon scale-up on hover |
| `.product-info-lift` | Product info lifts -4px when parent `.group` is hovered |

### Animation Rules

- **Always use** `ease-out-expo` or `ease-out-quart` — never `linear`
- **Only animate** `transform`, `opacity`, `filter`, `clip-path`
- **Never animate** `width`, `height`, `top`, `left`, `margin`, `padding`
- **Durations:** instant (100ms), fast (200ms), normal (300ms), slow (500ms), slower (800ms), slowest (1200ms)
- **Use `animationDelay`** via inline `style` for staggered entrance animations

---

## Component Patterns

The `components/ui/` directory contains base shadcn/ui components. When building Enunas-styled components, apply these class patterns:

### Enunas Button Variants

- **Primary:** `bg-enunas-purple text-white font-league-spartan text-sm tracking-[0.15em] uppercase px-8 py-4 hover:bg-enunas-purple-light` — or use `.btn-primary` class with `<span>` for reveal effect
- **Secondary (Outlined):** `border border-enunas-purple text-enunas-purple bg-transparent hover:bg-enunas-purple hover:text-white` + same font/tracking
- **Ghost:** `text-enunas-purple bg-transparent` with `.link-animated`-style underline via `group-hover`

### Product Card Pattern

- Outer: `group cursor-pointer`
- Image wrapper: `relative overflow-hidden aspect-[3/4] bg-enunas-off-white`
- Image: `object-cover transition-transform duration-800 ease-out-expo group-hover:scale-105`
- Brand label: `font-league-spartan text-xs text-enunas-gray-medium uppercase tracking-[0.1em]`
- Product name: `font-cormorant text-lg text-enunas-black`
- Price: `font-league-spartan text-sm text-enunas-gray-dark`

### Section Spacing

- **Hero Sections:** Full viewport height (`h-screen`)
- **Content Sections:** `py-24` to `py-32` (generous vertical space)
- **Product Grids:** `gap-6` to `gap-8`, 2-4 columns responsive
- **Between Components:** Minimum `space-y-6`
- **Max container width:** `max-w-[1800px] mx-auto px-6 lg:px-12`

---

## Tailwind CSS v4 Configuration

This project uses **Tailwind CSS v4** with CSS-based configuration via `@theme` blocks in `app/globals.css` instead of a JavaScript config file.

### Theme Tokens (defined in globals.css)

```css
@theme inline {
  /* Colors */
  --color-enunas-white: #FFFFFF;
  --color-enunas-off-white: #F5F5F0;
  --color-enunas-purple: #370E4D;
  --color-enunas-purple-light: #4A1566;
  --color-enunas-purple-dark: #250838;
  --color-enunas-purple-muted: rgba(55, 14, 77, 0.1);
  --color-enunas-black: #0A0A0A;
  --color-enunas-gray-light: #E8E8E8;
  --color-enunas-gray-medium: #6B6B6B;
  --color-enunas-gray-dark: #2D2D2D;
  --color-enunas-success: #1A5A3C;
  --color-enunas-error: #8B1E3F;
  --color-enunas-warning: #7A5C1E;

  /* Fonts */
  --font-league-spartan: 'League Spartan', sans-serif;
  --font-cormorant: 'Cormorant Garamond', serif;

  /* Easing */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);

  /* Durations */
  --duration-800: 800ms;
  --duration-1200: 1200ms;
}
```

### Available Tailwind Classes

- Colors: `bg-enunas-purple`, `text-enunas-white`, `border-enunas-gray-light`, etc.
- Fonts: `font-league-spartan`, `font-cormorant`
- Easing: `ease-out-expo`, `ease-out-quart`
- Durations: `duration-800`, `duration-1200`
- Animations: `animate-fade-in-up`, `animate-fade-in-scale`

---

*This document is Claude's binding reference for the Enunas project. All generated code must comply with these guidelines.*
