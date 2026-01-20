# ENUNAS - Project Guidelines for Claude

## Project Overview

**Enunas** is a curated fashion platform that combines luxury-oriented streetwear with a strong focus on storytelling, community, and technology.

The platform initially launches in Germany and gradually evolves into a marketplace that provides visibility to emerging designers and niche fashion brands through a highly selective curation process across Europe and later worldwide.

Rather than competing on price or scale, Enunas follows a **Customer Intimacy Strategy** that prioritizes product quality, brand identity, and customer experience.

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
| `app/(root)/(footer)/` | Static pages (Legal, FAQ, Policies) - German URLs |

### Product Routing Pattern

Dynamic product pages: `/bekleidung/[category]/[subcategory]/[slug]`

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
- API URL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:8080/api`)

---

## Design System & Branding

### Color Palette

The Enunas color scheme follows a minimalist, luxurious aesthetic:

```css
:root {
  /* ══════════════════════════════════════════════════════════
     PRIMARY COLORS - Enunas Core Colors
     ══════════════════════════════════════════════════════════ */

  --enunas-white: #FFFFFF;           /* Main background - Clean, Pure, Luxurious */
  --enunas-purple: #370E4D;          /* Brand color - Royal, Sophisticated, Deep */
  --enunas-off-white: #F5F5F0;       /* Accent color - Warm White, Subtle, Elegant */

  /* ══════════════════════════════════════════════════════════
     EXTENDED PURPLE PALETTE - For States and Depth
     ══════════════════════════════════════════════════════════ */

  --enunas-purple-light: #4A1566;                /* Hover/Active States */
  --enunas-purple-dark: #250838;                 /* Pressed States, Depth */
  --enunas-purple-muted: rgba(55, 14, 77, 0.1);  /* Subtle Backgrounds */

  /* ══════════════════════════════════════════════════════════
     NEUTRALS - For Text and UI Elements
     ══════════════════════════════════════════════════════════ */

  --enunas-black: #0A0A0A;           /* Primary text - softer than pure black */
  --enunas-gray-dark: #2D2D2D;       /* Secondary text */
  --enunas-gray-medium: #6B6B6B;     /* Tertiary text, icons */
  --enunas-gray-light: #E8E8E8;      /* Borders, dividers */

  /* ══════════════════════════════════════════════════════════
     SEMANTIC COLORS - Feedback States
     ══════════════════════════════════════════════════════════ */

  --enunas-success: #1A5A3C;
  --enunas-error: #8B1E3F;
  --enunas-warning: #7A5C1E;
}
```

### Color Usage Rules

| Element | Color | Hex |
|---------|-------|-----|
| **Primary Backgrounds** | `--enunas-white` | `#FFFFFF` |
| **Secondary Backgrounds** | `--enunas-off-white` | `#F5F5F0` |
| **CTAs, Links, Focus** | `--enunas-purple` | `#370E4D` |
| **Hover States** | `--enunas-purple-light` | `#4A1566` |
| **Headlines & Body** | `--enunas-black` | `#0A0A0A` |
| **Subtitles** | `--enunas-gray-dark` | `#2D2D2D` |
| **Borders & Dividers** | `--enunas-gray-light` | `#E8E8E8` |

---

## UI/UX Philosophy

### Inspiration: Alexander McQueen & Moncler

The UI must embody the essence of high-fashion luxury websites:

#### Core Design Principles

1. **Product & Content as Hero**
   - Layouts are restrained and designed with precision
   - Enhance content, never distract
   - Generous whitespace as a deliberate design element

2. **Fluid Motion Design** (Moncler Inspiration)
   - Smooth, elegant transitions between sections
   - Seamless page-to-page transitions
   - Motion that "effortlessly guides"

3. **Dramatic Elegance** (McQueen Inspiration)
   - Bold yet refined
   - Immersive visual exploration
   - Storytelling through design

4. **Restrained Typography**
   - Clean, minimal interface
   - Typography with craft and precision
   - No superfluous decorations

---

## Typography

### Font Stack (Already Implemented)

```css
:root {
  /* Display/Headlines - Bold, Modern */
  --font-league-spartan: 'League Spartan', sans-serif;

  /* Body/Elegant Text - Sophisticated Serif */
  --font-Cormorant-Garamond: 'Cormorant Garamond', serif;
}
```

### Usage Guidelines

| Application | Font | Properties |
|-------------|------|------------|
| **Headlines** | League Spartan | Bold/Semibold, Uppercase for impact |
| **Subheadlines** | Cormorant Garamond | Medium, Elegant |
| **Body Text** | League Spartan | Regular, Line-Height 1.6-1.7 |
| **Accents/Labels** | League Spartan | Uppercase, Letter-Spacing 0.1em-0.15em |
| **Prices/Numbers** | League Spartan | Tabular numbers when available |

### Type Scale

```css
:root {
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
  --text-3xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem);
  --text-4xl: clamp(2.25rem, 1.75rem + 2.5vw, 3rem);
  --text-5xl: clamp(3rem, 2rem + 5vw, 4.5rem);
  --text-hero: clamp(3.5rem, 2.5rem + 7.5vw, 7rem);
}
```

---

## Animation Guidelines

### Animation Philosophy

Inspired by **Moncler's "Fluid Motion Design"** and **Alexander McQueen's dramatic elegance**.

### Timing Variables

```css
:root {
  /* ══════════════════════════════════════════════════════════
     EASING FUNCTIONS - Luxury Feel
     Never linear! Always ease-out for natural movement
     ══════════════════════════════════════════════════════════ */

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);      /* PRIMARY - Smooth deceleration */
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);     /* SECONDARY - Softer */
  --ease-in-out-sine: cubic-bezier(0.37, 0, 0.63, 1);  /* Subtle transitions */

  /* ══════════════════════════════════════════════════════════
     DURATIONS - Consistent timing
     ══════════════════════════════════════════════════════════ */

  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 800ms;
  --duration-slowest: 1200ms;
}
```

### Required Animation Types

#### 1. Fade In Up (Standard for Text Blocks)

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp var(--duration-slower) var(--ease-out-expo) forwards;
  opacity: 0;
}
```

#### 2. Fade In Scale (For Images and Cards)

```css
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in-scale {
  animation: fadeInScale var(--duration-slower) var(--ease-out-expo) forwards;
  opacity: 0;
}
```

#### 3. Stagger Reveal (For Lists and Grid Items)

```css
/* Parent Grid */
.stagger-container > * {
  opacity: 0;
  animation: fadeInUp var(--duration-slower) var(--ease-out-expo) forwards;
}

.stagger-container > *:nth-child(1) { animation-delay: 0ms; }
.stagger-container > *:nth-child(2) { animation-delay: 100ms; }
.stagger-container > *:nth-child(3) { animation-delay: 200ms; }
.stagger-container > *:nth-child(4) { animation-delay: 300ms; }
.stagger-container > *:nth-child(5) { animation-delay: 400ms; }
.stagger-container > *:nth-child(6) { animation-delay: 500ms; }
/* Add more as needed... */
```

#### 4. Parallax (Subtle for Background Elements)

```css
/* Max 20% offset - keep it subtle! */
.parallax-element {
  will-change: transform;
  transition: transform 0.1s linear;
}

/* Via JavaScript/Framer Motion:
   translateY = scrollProgress * 0.2 (max 20%)
*/
```

### Scroll-Triggered Animations

```typescript
// Intersection Observer Setup
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

// Elements with data-animate are animated on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);
```

### Hover & Micro-Interactions

#### Button Hover

```css
/* Primary Button - Reveal Effect */
.btn-primary {
  position: relative;
  background: var(--enunas-purple);
  color: var(--enunas-white);
  overflow: hidden;
  transition: color var(--duration-normal) var(--ease-out-quart);
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--enunas-white);
  transform: translateY(100%);
  transition: transform var(--duration-slow) var(--ease-out-expo);
}

.btn-primary:hover::before {
  transform: translateY(0);
}

.btn-primary:hover {
  color: var(--enunas-purple);
}

.btn-primary span {
  position: relative;
  z-index: 1;
}
```

#### Image Hover (Product Cards)

```css
.product-image-container {
  overflow: hidden;
}

.product-image {
  transition: transform var(--duration-slower) var(--ease-out-expo);
}

.product-image-container:hover .product-image {
  transform: scale(1.05);
}
```

#### Link Underline Animation

```css
.link-animated {
  position: relative;
}

.link-animated::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--enunas-purple);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform var(--duration-normal) var(--ease-out-expo);
}

.link-animated:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
```

### Accessibility: Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Component Patterns

### Buttons

```tsx
// Primary Button
<button className="
  relative overflow-hidden
  px-8 py-4
  bg-enunas-purple text-white
  font-league-spartan text-sm tracking-[0.15em] uppercase
  transition-colors duration-300 ease-out-expo
  hover:bg-enunas-purple-light
  focus:outline-none focus:ring-2 focus:ring-enunas-purple focus:ring-offset-2
">
  <span className="relative z-10">Discover</span>
</button>

// Secondary Button (Outlined)
<button className="
  px-8 py-4
  border border-enunas-purple text-enunas-purple bg-transparent
  font-league-spartan text-sm tracking-[0.15em] uppercase
  transition-all duration-300 ease-out-expo
  hover:bg-enunas-purple hover:text-white
">
  Learn More
</button>

// Ghost Button (Minimal)
<button className="
  group relative
  px-4 py-2
  text-enunas-purple bg-transparent
  font-league-spartan text-sm tracking-[0.1em] uppercase
">
  <span>View All</span>
  <span className="
    absolute bottom-0 left-0
    w-full h-px bg-enunas-purple
    scale-x-0 origin-right
    transition-transform duration-300 ease-out-expo
    group-hover:scale-x-100 group-hover:origin-left
  "/>
</button>
```

### Product Card (Moncler-Style)

```tsx
<article className="group cursor-pointer">
  {/* Image Container */}
  <div className="relative overflow-hidden aspect-[3/4] bg-enunas-off-white">
    <Image
      src={product.image}
      alt={product.name}
      fill
      className="
        object-cover
        transition-transform duration-800 ease-out-expo
        group-hover:scale-105
      "
    />
    {/* Subtle Overlay on Hover */}
    <div className="
      absolute inset-0
      bg-enunas-purple/0
      transition-colors duration-300
      group-hover:bg-enunas-purple/5
    "/>
    {/* Quick Add Button (optional) */}
    <button className="
      absolute bottom-4 left-4 right-4
      py-3 bg-white text-enunas-purple
      font-league-spartan text-xs tracking-[0.15em] uppercase
      opacity-0 translate-y-2
      transition-all duration-300 ease-out-expo
      group-hover:opacity-100 group-hover:translate-y-0
    ">
      Quick View
    </button>
  </div>

  {/* Product Info */}
  <div className="pt-4 space-y-1">
    <p className="font-league-spartan text-xs text-enunas-gray-medium uppercase tracking-[0.1em]">
      {product.brand}
    </p>
    <h3 className="font-cormorant text-lg text-enunas-black">
      {product.name}
    </h3>
    <p className="font-league-spartan text-sm text-enunas-gray-dark">
      €{product.price}
    </p>
  </div>
</article>
```

### Navigation Header

```tsx
<header className="
  fixed top-0 inset-x-0 z-50
  bg-white/95 backdrop-blur-sm
  border-b border-enunas-gray-light/50
  transition-all duration-300
">
  <nav className="
    max-w-[1800px] mx-auto px-6 lg:px-12
    h-20 flex items-center justify-between
  ">
    {/* Logo */}
    <Link
      href="/"
      className="font-league-spartan text-2xl font-bold tracking-[0.05em] text-enunas-purple"
    >
      ENUNAS
    </Link>

    {/* Navigation Links */}
    <ul className="hidden lg:flex items-center gap-8">
      {navItems.map(item => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="
              font-league-spartan text-xs tracking-[0.15em] uppercase
              text-enunas-gray-dark
              transition-colors duration-300
              hover:text-enunas-purple
            "
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>

    {/* Actions (Cart, Account, etc.) */}
    <div className="flex items-center gap-6">
      {/* ... */}
    </div>
  </nav>
</header>
```

### Hero Section

```tsx
<section className="relative h-screen overflow-hidden">
  {/* Background Image/Video */}
  <div className="absolute inset-0">
    <Image
      src="/assets/images/hero.jpg"
      alt=""
      fill
      priority
      className="object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent" />
  </div>

  {/* Content */}
  <div className="
    relative z-10
    h-full flex flex-col justify-end
    max-w-[1800px] mx-auto px-6 lg:px-12 pb-24
  ">
    <div className="max-w-2xl space-y-6">
      <h1
        className="
          font-cormorant text-hero text-enunas-black
          animate-fade-in-up
        "
        style={{ animationDelay: '200ms' }}
      >
        New Collection
      </h1>
      <p
        className="
          font-league-spartan text-xl text-enunas-gray-dark
          animate-fade-in-up
        "
        style={{ animationDelay: '400ms' }}
      >
        Curated streetwear for the discerning style
      </p>
      <div
        className="animate-fade-in-up"
        style={{ animationDelay: '600ms' }}
      >
        <Link
          href="/neu"
          className="
            inline-block px-8 py-4
            bg-enunas-purple text-white
            font-league-spartan text-sm tracking-[0.15em] uppercase
            transition-colors duration-300
            hover:bg-enunas-purple-light
          "
        >
          Discover Now
        </Link>
      </div>
    </div>
  </div>
</section>
```

---

## Layout Guidelines

### Container Widths

```css
:root {
  --max-width-sm: 640px;    /* Narrow text content */
  --max-width-md: 768px;    /* Forms, medium content */
  --max-width-lg: 1024px;   /* Standard content */
  --max-width-xl: 1280px;   /* Wide content */
  --max-width-2xl: 1536px;  /* Full-width sections */
  --max-width-full: 1800px; /* Edge-to-edge with padding */
}
```

### Spacing Scale

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
}
```

### Section Spacing

- **Hero Sections**: Full viewport height (`h-screen`)
- **Content Sections**: `py-24` to `py-32` (generous vertical space)
- **Product Grids**: `gap-6` to `gap-8`, 2-4 columns responsive
- **Between Components**: Minimum `space-y-6`

---

## Performance Guidelines

### Animation Performance Rules

```css
/* ONLY animate transform and opacity for 60fps */
.performant-animation {
  will-change: transform, opacity;
  transform: translateZ(0); /* GPU Layer */
}

/* Clean up after animation */
.animation-complete {
  will-change: auto;
}
```

### NEVER Animate:
- `width`, `height`
- `top`, `left`, `right`, `bottom`
- `margin`, `padding`
- `border-width`
- `font-size`

### ALWAYS Animate:
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (blur, brightness)
- `clip-path`

### Image Optimization

1. Use Next.js `<Image>` component
2. Provide WebP/AVIF formats
3. Implement blur placeholder
4. Set responsive `sizes` attribute
5. `priority` for above-the-fold images

---

## Checklist for Claude

**Before generating code, verify:**

- [ ] Uses the Enunas color scheme (`#FFFFFF`, `#370E4D`, `#F5F5F0`)
- [ ] Animations use `ease-out-expo` or `ease-out-quart`
- [ ] Typography uses League Spartan and Cormorant Garamond
- [ ] Hover states are implemented with smooth transitions
- [ ] Layout uses generous whitespace
- [ ] Mobile-first responsive design (768px breakpoint)
- [ ] `prefers-reduced-motion` is respected
- [ ] Performance: Only animate `transform` and `opacity`
- [ ] No "AI-slop" design
- [ ] Components follow established patterns from `components/ui/`
- [ ] Utility classes use `cn()` from `lib/utils.ts`

---

## What to Avoid

### 1. Generic AI Aesthetic
- No purple gradients on white background
- No overused fonts like Inter, Roboto, Arial
- No predictable, cookie-cutter layouts
- No generic icon sets

### 2. Excessive Decoration
- No unnecessary box-shadows or glow effects
- No overloaded borders or ornaments
- No decorative elements without function
- Less is more

### 3. Abrupt Animations
- No linear timing functions (`linear`)
- No animations too fast (<100ms) or too slow (>1500ms)
- No "bouncy" or "springy" effects
- No `ease-in` for UI elements (feels sluggish)

### 4. Poor Performance
- No layout-animating properties
- No unoptimized images
- No blocking render resources
- No excessive re-renders

### 5. Accessibility Violations
- No animations without `prefers-reduced-motion` fallback
- No low contrast ratios
- No missing focus states

---

## Reference Links

- [Alexander McQueen](https://www.alexandermcqueen.com) - Dramatic Elegance
- [Moncler](https://www.moncler.com) - Fluid Motion Design
- [R/GA Moncler Case Study](https://rga.com/work/moncler) - Design Philosophy

---

## Tailwind CSS v4 Configuration

This project uses **Tailwind CSS v4** which uses CSS-based configuration via `@theme` blocks in `app/globals.css` instead of a JavaScript config file.

### Current Theme Extension (add to globals.css)

```css
@import "tailwindcss";

@theme inline {
  /* ══════════════════════════════════════════════════════════
     ENUNAS COLORS
     ══════════════════════════════════════════════════════════ */

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

  /* ══════════════════════════════════════════════════════════
     FONTS
     ══════════════════════════════════════════════════════════ */

  --font-league-spartan: 'League Spartan', sans-serif;
  --font-cormorant: 'Cormorant Garamond', serif;

  /* ══════════════════════════════════════════════════════════
     EASING FUNCTIONS
     ══════════════════════════════════════════════════════════ */

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);

  /* ══════════════════════════════════════════════════════════
     DURATIONS
     ══════════════════════════════════════════════════════════ */

  --duration-800: 800ms;
  --duration-1200: 1200ms;

  /* ══════════════════════════════════════════════════════════
     ANIMATIONS
     ══════════════════════════════════════════════════════════ */

  --animate-fade-in-up: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  --animate-fade-in-scale: fadeInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  --animate-fade-in: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Keyframes */
@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInScale {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
```

### Usage in Components

With this configuration, you can use classes like:
- `bg-enunas-purple`, `text-enunas-white`, `border-enunas-gray-light`
- `font-league-spartan`, `font-cormorant`
- `ease-out-expo`, `ease-out-quart`
- `duration-800`, `duration-1200`
- `animate-fade-in-up`, `animate-fade-in-scale`

---

*This document serves as Claude's binding reference for consistent, high-quality UI development in the Enunas project. All generated components must comply with these guidelines.*
