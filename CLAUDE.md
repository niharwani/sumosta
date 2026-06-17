# CLAUDE.md — SUMOSTA Honey E-Commerce Platform

> This file is the single source of truth for building SUMOSTA. Read it completely before writing any code. Every architectural decision, design token, animation pattern, and implementation detail lives here.

---

## TABLE OF CONTENTS

1. [Project Identity](#1-project-identity)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Repository Structure](#3-repository-structure)
4. [Design System](#4-design-system)
5. [Animation Architecture](#5-animation-architecture)
6. [Page-by-Page Build Specs](#6-page-by-page-build-specs)
7. [Component Library](#7-component-library)
8. [Backend API (Cloudflare Workers + Hono)](#8-backend-api)
9. [Database Schema (Cloudflare D1)](#9-database-schema)
10. [PhonePe Payment Integration](#10-phonepe-payment-integration)
11. [Analytics & Tracking](#11-analytics--tracking)
12. [Admin Panel](#12-admin-panel)
13. [Infrastructure & Deployment](#13-infrastructure--deployment)
14. [Code Standards & Conventions](#14-code-standards--conventions)
15. [Build Order (14-Day Sprint)](#15-build-order)

---

## 1. PROJECT IDENTITY

**Brand:** SUMOSTA
**Tagline:** "Nature's Golden Promise"
**Product Line (Launch):** Premium honey products — raw honey jars, honey sticks (individual & packs), flavored honey spreads (cinnamon, vanilla, cardamom, turmeric), honeycomb pieces, gift boxes
**Target Audience:** Health-conscious urban Indians (25–45), gifting buyers, organic food enthusiasts
**Brand Personality:** Warm, artisanal, rooted in nature, but modern and premium — not rustic-cottage, think luxury-nature. Like if Aesop sold honey.
**Domain:** sumosta.com
**Currency:** INR (₹) only
**Shipping:** India only at launch

### Brand Story (use across site)
SUMOSTA sources single-origin honey from wild bee colonies across Western Ghats, Sundarbans, and Himalayan foothills. Each batch is raw, unprocessed, and traceable to its apiary. The name SUMOSTA comes from the Sanskrit root for "sweetness" — we believe honey is nature's most perfect creation, and we refuse to compromise it.

---

## 2. TECH STACK & DEPENDENCIES

### Core

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui (selective) | latest |
| Animations | Framer Motion | 11.x |
| Animations (complex) | anime.js | 3.x |
| 3D/WebGL | Three.js (honey drip hero only) | r160+ |
| Icons | Lucide React | latest |
| Forms | React Hook Form + Zod | latest |
| State | Zustand | latest |
| API Client | TanStack Query | 5.x |

### Backend

| Layer | Technology |
|-------|-----------|
| Runtime | Cloudflare Workers |
| API Framework | Hono |
| Database | Cloudflare D1 (SQLite) |
| Object Storage | Cloudflare R2 |
| KV Store | Cloudflare KV |
| Analytics | Cloudflare Analytics Engine |
| Email | Resend |
| Payments | PhonePe Standard Checkout API |
| Validation | Zod (shared with frontend) |

### Dev Tools

```bash
# Package manager: pnpm (use pnpm exclusively, never npm/yarn)
# Monorepo: Turborepo
# Linting: ESLint + Prettier
# Git hooks: Husky + lint-staged
# DB migrations: Custom SQL files run via wrangler d1 execute
```

### Install Commands

```bash
pnpm create turbo@latest sumosta --example basic
cd sumosta

# Frontend dependencies
pnpm add next react react-dom typescript tailwindcss postcss autoprefixer
pnpm add framer-motion animejs three @react-three/fiber @react-three/drei
pnpm add zustand @tanstack/react-query react-hook-form @hookform/resolvers zod
pnpm add lucide-react clsx tailwind-merge class-variance-authority
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast
pnpm add @radix-ui/react-tabs @radix-ui/react-accordion @radix-ui/react-select
pnpm add embla-carousel-react lenis                  # carousel + smooth scroll
pnpm add recharts date-fns                           # admin charts + date utils
pnpm add -D @types/react @types/node @types/three @types/animejs

# Backend dependencies (in apps/api)
pnpm add hono zod jose bcryptjs nanoid
pnpm add -D wrangler @cloudflare/workers-types
```

---

## 3. REPOSITORY STRUCTURE

```
sumosta/
├── CLAUDE.md                          ← YOU ARE HERE
├── turbo.json
├── pnpm-workspace.yaml
├── apps/
│   ├── web/                           ← Next.js storefront + admin
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── public/
│   │   │   ├── fonts/
│   │   │   │   ├── ClashDisplay-Variable.woff2
│   │   │   │   ├── Satoshi-Variable.woff2
│   │   │   │   └── BespokeSerif-Variable.woff2
│   │   │   ├── images/
│   │   │   │   ├── hero/              ← hero section assets
│   │   │   │   ├── textures/          ← honey, honeycomb, paper textures
│   │   │   │   ├── products/          ← product photography placeholders
│   │   │   │   └── brand/             ← about page, story images
│   │   │   ├── honey-drip.glb         ← 3D honey drip model (hero)
│   │   │   ├── og-image.jpg
│   │   │   ├── favicon.ico
│   │   │   └── site.webmanifest
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx                    ← Root layout (fonts, providers, smooth scroll)
│   │   │   │   ├── page.tsx                      ← Homepage
│   │   │   │   ├── globals.css                   ← Tailwind + custom CSS vars + animation keyframes
│   │   │   │   ├── (storefront)/                 ← Route group for customer pages
│   │   │   │   │   ├── layout.tsx                ← Storefront layout (nav + footer)
│   │   │   │   │   ├── shop/
│   │   │   │   │   │   ├── page.tsx              ← Product listing
│   │   │   │   │   │   └── [category]/page.tsx   ← Category filtered
│   │   │   │   │   ├── product/
│   │   │   │   │   │   └── [slug]/page.tsx       ← Product detail page
│   │   │   │   │   ├── cart/page.tsx
│   │   │   │   │   ├── checkout/page.tsx
│   │   │   │   │   ├── order-confirmation/
│   │   │   │   │   │   └── [id]/page.tsx
│   │   │   │   │   ├── payment-failed/page.tsx
│   │   │   │   │   ├── account/
│   │   │   │   │   │   ├── layout.tsx
│   │   │   │   │   │   ├── orders/page.tsx
│   │   │   │   │   │   ├── orders/[id]/page.tsx
│   │   │   │   │   │   ├── profile/page.tsx
│   │   │   │   │   │   └── addresses/page.tsx
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   │   ├── register/page.tsx
│   │   │   │   │   │   └── forgot-password/page.tsx
│   │   │   │   │   ├── about/page.tsx
│   │   │   │   │   ├── contact/page.tsx
│   │   │   │   │   ├── track/page.tsx
│   │   │   │   │   ├── search/page.tsx
│   │   │   │   │   └── policies/
│   │   │   │   │       ├── privacy/page.tsx
│   │   │   │   │       ├── terms/page.tsx
│   │   │   │   │       ├── shipping/page.tsx
│   │   │   │   │       └── refund/page.tsx
│   │   │   │   └── admin/                        ← Admin route group
│   │   │   │       ├── layout.tsx                ← Admin shell (sidebar + header)
│   │   │   │       ├── page.tsx                  ← Dashboard
│   │   │   │       ├── login/page.tsx
│   │   │   │       ├── orders/
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   └── [id]/page.tsx
│   │   │   │       ├── products/
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   ├── new/page.tsx
│   │   │   │       │   └── [id]/edit/page.tsx
│   │   │   │       ├── categories/page.tsx
│   │   │   │       ├── customers/
│   │   │   │       │   ├── page.tsx
│   │   │   │       │   └── [id]/page.tsx
│   │   │   │       ├── coupons/page.tsx
│   │   │   │       ├── reviews/page.tsx
│   │   │   │       ├── analytics/
│   │   │   │       │   ├── page.tsx              ← Overview
│   │   │   │       │   ├── sales/page.tsx
│   │   │   │       │   ├── traffic/page.tsx
│   │   │   │       │   ├── funnel/page.tsx
│   │   │   │       │   ├── products/page.tsx
│   │   │   │       │   ├── customers/page.tsx
│   │   │   │       │   └── realtime/page.tsx
│   │   │   │       ├── media/page.tsx
│   │   │   │       └── settings/
│   │   │   │           ├── page.tsx
│   │   │   │           ├── shipping/page.tsx
│   │   │   │           ├── payments/page.tsx
│   │   │   │           └── team/page.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/                           ← shadcn/ui primitives (button, input, etc.)
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Navbar.tsx
│   │   │   │   │   ├── MobileMenu.tsx
│   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   ├── CartDrawer.tsx
│   │   │   │   │   └── AnnouncementBar.tsx
│   │   │   │   ├── home/
│   │   │   │   │   ├── HeroSection.tsx           ← 3D honey drip + anime.js text reveal
│   │   │   │   │   ├── ProductShowcase.tsx       ← Horizontal scroll carousel
│   │   │   │   │   ├── HoneyProcess.tsx          ← Scroll-driven storytelling
│   │   │   │   │   ├── CategoryGrid.tsx          ← Animated category cards
│   │   │   │   │   ├── TestimonialCarousel.tsx
│   │   │   │   │   ├── NewsletterSection.tsx
│   │   │   │   │   └── InstagramFeed.tsx
│   │   │   │   ├── product/
│   │   │   │   │   ├── ProductCard.tsx           ← Reusable card with hover effects
│   │   │   │   │   ├── ProductGallery.tsx        ← Image gallery with zoom
│   │   │   │   │   ├── VariantSelector.tsx
│   │   │   │   │   ├── AddToCartButton.tsx       ← Animated add-to-cart
│   │   │   │   │   ├── ProductInfo.tsx
│   │   │   │   │   ├── ReviewSection.tsx
│   │   │   │   │   └── RelatedProducts.tsx
│   │   │   │   ├── cart/
│   │   │   │   │   ├── CartItem.tsx
│   │   │   │   │   ├── CartSummary.tsx
│   │   │   │   │   └── CouponInput.tsx
│   │   │   │   ├── checkout/
│   │   │   │   │   ├── AddressForm.tsx
│   │   │   │   │   ├── OrderSummary.tsx
│   │   │   │   │   └── PaymentButton.tsx
│   │   │   │   ├── shared/
│   │   │   │   │   ├── AnimatedText.tsx          ← Reusable text reveal component
│   │   │   │   │   ├── MagneticButton.tsx        ← Magnetic hover effect button
│   │   │   │   │   ├── ParallaxImage.tsx
│   │   │   │   │   ├── RevealOnScroll.tsx        ← Intersection observer + framer
│   │   │   │   │   ├── HoneycombLoader.tsx       ← Custom loading animation
│   │   │   │   │   ├── SmoothCounter.tsx         ← Animated number counter
│   │   │   │   │   ├── CursorFollower.tsx        ← Custom cursor (desktop only)
│   │   │   │   │   ├── GoldenDivider.tsx         ← Decorative honey-drip divider SVG
│   │   │   │   │   ├── PageTransition.tsx        ← Page-level enter/exit animations
│   │   │   │   │   └── LenisProvider.tsx         ← Smooth scroll wrapper
│   │   │   │   └── admin/
│   │   │   │       ├── AdminSidebar.tsx
│   │   │   │       ├── AdminHeader.tsx
│   │   │   │       ├── StatsCard.tsx
│   │   │   │       ├── DataTable.tsx             ← Reusable sortable/filterable table
│   │   │   │       ├── ChartCard.tsx
│   │   │   │       ├── OrderTimeline.tsx
│   │   │   │       ├── ProductForm.tsx
│   │   │   │       ├── ImageUploader.tsx
│   │   │   │       ├── RichTextEditor.tsx
│   │   │   │       └── AnalyticsDashboard.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useCart.ts                    ← Zustand cart store
│   │   │   │   ├── useAuth.ts                    ← Auth state + token management
│   │   │   │   ├── useAnime.ts                   ← anime.js wrapper hook
│   │   │   │   ├── useScrollProgress.ts          ← Scroll % for parallax
│   │   │   │   ├── useMediaQuery.ts
│   │   │   │   ├── useInView.ts                  ← Intersection observer
│   │   │   │   ├── useMagnetic.ts                ← Magnetic hover effect logic
│   │   │   │   ├── useDebounce.ts
│   │   │   │   └── useLocalStorage.ts
│   │   │   ├── lib/
│   │   │   │   ├── api.ts                        ← API client (fetch wrapper + auth headers)
│   │   │   │   ├── utils.ts                      ← cn(), formatPrice(), slugify()
│   │   │   │   ├── constants.ts                  ← Site config, nav links, footer links
│   │   │   │   ├── fonts.ts                      ← Next.js local font loaders
│   │   │   │   ├── animations.ts                 ← Shared framer motion variants
│   │   │   │   ├── anime-presets.ts              ← Reusable anime.js timeline configs
│   │   │   │   └── tracker.ts                    ← Client-side analytics tracker
│   │   │   ├── stores/
│   │   │   │   ├── cart-store.ts
│   │   │   │   ├── auth-store.ts
│   │   │   │   └── ui-store.ts                   ← Modal states, mobile menu, etc.
│   │   │   └── types/
│   │   │       ├── product.ts
│   │   │       ├── order.ts
│   │   │       ├── user.ts
│   │   │       └── analytics.ts
│   │   └── package.json
│   └── api/                                      ← Cloudflare Workers API
│       ├── src/
│       │   ├── index.ts                          ← Hono app entry
│       │   ├── middleware/
│       │   │   ├── auth.ts                       ← JWT verification
│       │   │   ├── admin.ts                      ← Admin role check
│       │   │   ├── cors.ts
│       │   │   ├── rateLimit.ts
│       │   │   └── analytics.ts                  ← Auto-log every request
│       │   ├── routes/
│       │   │   ├── products.ts
│       │   │   ├── categories.ts
│       │   │   ├── auth.ts
│       │   │   ├── cart.ts
│       │   │   ├── checkout.ts
│       │   │   ├── orders.ts
│       │   │   ├── reviews.ts
│       │   │   ├── coupons.ts
│       │   │   ├── payments.ts                   ← PhonePe handlers
│       │   │   ├── analytics.ts
│       │   │   ├── contact.ts
│       │   │   ├── newsletter.ts
│       │   │   └── admin/
│       │   │       ├── dashboard.ts
│       │   │       ├── products.ts
│       │   │       ├── orders.ts
│       │   │       ├── customers.ts
│       │   │       ├── coupons.ts
│       │   │       ├── reviews.ts
│       │   │       ├── analytics.ts
│       │   │       ├── media.ts
│       │   │       └── settings.ts
│       │   ├── services/
│       │   │   ├── phonepe.ts                    ← PhonePe API wrapper
│       │   │   ├── email.ts                      ← Resend wrapper
│       │   │   ├── r2.ts                         ← R2 upload/delete helpers
│       │   │   └── analytics.ts                  ← Analytics Engine writer
│       │   ├── db/
│       │   │   ├── schema.sql                    ← Full D1 schema
│       │   │   ├── seed.sql                      ← Sample product data
│       │   │   └── queries/                      ← Parameterized query builders
│       │   │       ├── products.ts
│       │   │       ├── orders.ts
│       │   │       ├── users.ts
│       │   │       └── analytics.ts
│       │   └── lib/
│       │       ├── jwt.ts
│       │       ├── hash.ts
│       │       ├── validators.ts                 ← Zod schemas for all inputs
│       │       └── utils.ts
│       ├── wrangler.toml
│       └── package.json
└── packages/
    └── shared/                                   ← Shared types + validation
        ├── src/
        │   ├── types.ts
        │   ├── validators.ts                     ← Zod schemas used by both frontend + API
        │   └── constants.ts
        ├── tsconfig.json
        └── package.json
```

---

## 4. DESIGN SYSTEM

### Philosophy

SUMOSTA's visual identity is **"liquid gold minimalism"** — the warmth and viscosity of honey married with clean Swiss-grid precision. The site should feel like honey itself: smooth, warm, slightly luxurious, with moments of golden delight. NOT a farm/cottage aesthetic. Think Aesop meets Maison Margiela, but warmer.

### Typography

Use self-hosted variable fonts. **Never use Google Fonts CDN** — download and serve from `/public/fonts/`.

| Role | Font | Weight Range | Usage |
|------|------|-------------|-------|
| **Display** | Clash Display (variable) | 400–700 | Hero headlines, section titles, product names. Use sparingly — max 2–3 per viewport. |
| **Body** | Satoshi (variable) | 400–700 | All body text, UI elements, buttons, nav, descriptions. |
| **Accent** | Bespoke Serif (variable) | 400–700 | Pull quotes, taglines, decorative text overlays, editorial moments. Italic for special emphasis. |

```typescript
// src/lib/fonts.ts
import localFont from 'next/font/local';

export const clashDisplay = localFont({
  src: '../../public/fonts/ClashDisplay-Variable.woff2',
  variable: '--font-clash',
  display: 'swap',
});

export const satoshi = localFont({
  src: '../../public/fonts/Satoshi-Variable.woff2',
  variable: '--font-satoshi',
  display: 'swap',
});

export const bespokeSerif = localFont({
  src: '../../public/fonts/BespokeSerif-Variable.woff2',
  variable: '--font-bespoke',
  display: 'swap',
});
```

**Type Scale (rem):**
```
text-hero:    clamp(3.5rem, 8vw, 7rem)    — Hero headline only
text-display: clamp(2.5rem, 5vw, 4.5rem)  — Section titles
text-title:   clamp(1.75rem, 3vw, 2.5rem) — Product names, page titles
text-heading: 1.5rem                        — Card headings, subtitles
text-body-lg: 1.125rem                      — Lead paragraphs
text-body:    1rem                           — Default body
text-small:   0.875rem                       — Captions, metadata
text-micro:   0.75rem                        — Labels, badges
```

### Color Palette

```css
:root {
  /* === PRIMARY — Honey Spectrum === */
  --honey-50:       #FFF9F0;    /* Lightest honey tint — backgrounds */
  --honey-100:      #FFF0D6;    /* Light honey wash */
  --honey-200:      #FFE0A8;    /* Soft gold */
  --honey-300:      #FFCC66;    /* Warm honey */
  --honey-400:      #F5A623;    /* Primary honey — CTAs, accents */
  --honey-500:      #D4891A;    /* Deep honey */
  --honey-600:      #A66A10;    /* Dark honey — hover states */
  --honey-700:      #7A4D0B;    /* Rich amber */

  /* === NEUTRAL — Warm Cream to Charcoal === */
  --cream:          #FFFDF8;    /* Page background */
  --cream-warm:     #FDF6EC;    /* Card backgrounds, alternating sections */
  --sand:           #F0E6D3;    /* Borders, subtle dividers */
  --earth-light:    #C4B39A;    /* Muted text, placeholders */
  --earth:          #8B7355;    /* Secondary text */
  --bark:           #5C4A32;    /* Body text */
  --charcoal:       #2C2417;    /* Headings, primary text */
  --midnight:       #1A150E;    /* Deepest — footer bg, dark sections */

  /* === ACCENT — Botanical === */
  --sage:           #7C9A6E;    /* Success states, organic badges */
  --sage-light:     #E8F0E4;    /* Success backgrounds */
  --terracotta:     #C4573A;    /* Error states, sale badges */
  --terracotta-light: #FDE8E3; /* Error backgrounds */
  --beeswax:        #F7E89E;    /* Highlight, notification badges */

  /* === FUNCTIONAL === */
  --overlay:        rgba(26, 21, 14, 0.6);
  --glass:          rgba(255, 253, 248, 0.8);
  --shadow-sm:      0 1px 3px rgba(44, 36, 23, 0.06);
  --shadow-md:      0 4px 12px rgba(44, 36, 23, 0.08);
  --shadow-lg:      0 12px 40px rgba(44, 36, 23, 0.12);
  --shadow-honey:   0 8px 30px rgba(245, 166, 35, 0.2);  /* Golden glow */
}
```

**CRITICAL: The page background is `--cream` (#FFFDF8), NOT white. Never use pure white (#FFFFFF) anywhere on the storefront.**

### Spacing Scale

Use Tailwind defaults but extend:
```javascript
// tailwind.config.ts extend.spacing
{
  '18': '4.5rem',
  '22': '5.5rem',
  '30': '7.5rem',
  '34': '8.5rem',
  '128': '32rem',
}
```

### Border Radius

```
rounded-sm:   4px    — Inputs, small elements
rounded-md:   8px    — Cards, buttons
rounded-lg:   12px   — Product cards, modals
rounded-xl:   16px   — Feature cards, hero elements
rounded-2xl:  24px   — Large containers
rounded-full: 9999px — Pills, avatars, circular buttons
```

### Layout Grid

```
Max content width: 1400px (max-w-[1400px] mx-auto)
Gutter: px-6 (mobile) → px-8 (tablet) → px-12 (desktop)
Section vertical spacing: py-20 (mobile) → py-32 (desktop)
Product grid: 1 col (mobile) → 2 col (tablet) → 3 col (laptop) → 4 col (desktop)
```

### Imagery Style

- Product images: Clean, bright, on cream/honey-tinted backgrounds with natural shadows. Never on pure white.
- Lifestyle images: Warm golden-hour photography. Honey being poured, dripping, spread on bread. Bees on flowers. Western Ghats landscapes.
- Use subtle grain/noise texture overlay (CSS) on hero and feature sections for organic feel.
- All images via Cloudflare R2 + Image Resizing (WebP, responsive srcset).

---

## 5. ANIMATION ARCHITECTURE

### Philosophy

Animations should feel like honey — smooth, fluid, slightly viscous. Nothing snappy or bouncy. The easing curve for SUMOSTA is always **smooth and slightly decelerating**, like honey settling into a spoon.

### Easing Curves (use globally)

```typescript
// src/lib/animations.ts

// Primary easing — use for 90% of animations
export const HONEY_EASE = [0.25, 0.1, 0.25, 1.0];        // CSS: cubic-bezier(0.25, 0.1, 0.25, 1.0)
export const HONEY_EASE_OUT = [0.16, 1, 0.3, 1];          // For elements entering
export const HONEY_EASE_IN_OUT = [0.65, 0, 0.35, 1];      // For transitions

// For Framer Motion
export const honeyTransition = {
  duration: 0.8,
  ease: HONEY_EASE,
};

export const honeySpring = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 1,
};
```

### Framer Motion — Shared Variants

```typescript
// src/lib/animations.ts

export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: HONEY_EASE_OUT },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: HONEY_EASE },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: HONEY_EASE_OUT },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: HONEY_EASE_OUT },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: HONEY_EASE_OUT },
  },
};

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: HONEY_EASE_OUT } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: HONEY_EASE } },
};
```

### Anime.js — When to Use

Use anime.js (NOT Framer Motion) for these specific cases:
1. **Text character-by-character reveal** — hero headline, section titles
2. **SVG path animations** — honey drip SVG, honeycomb pattern morph, golden dividers
3. **Complex staggered sequences** — multiple elements with precise offset timing
4. **Number counters** — stats section, cart total animation

```typescript
// src/hooks/useAnime.ts
import { useEffect, useRef } from 'react';
import anime from 'animejs';

export function useAnime(
  animationFactory: (el: HTMLElement) => anime.AnimeInstance | anime.AnimeTimelineInstance,
  deps: any[] = []
) {
  const ref = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<anime.AnimeInstance | anime.AnimeTimelineInstance>();

  useEffect(() => {
    if (!ref.current) return;
    instanceRef.current = animationFactory(ref.current);
    return () => instanceRef.current?.pause();
  }, deps);

  return { ref, instance: instanceRef };
}
```

```typescript
// src/lib/anime-presets.ts
import anime from 'animejs';

// Character-by-character text reveal
export function textReveal(container: HTMLElement, selector: string = '.char') {
  return anime({
    targets: container.querySelectorAll(selector),
    opacity: [0, 1],
    translateY: [40, 0],
    rotateX: [90, 0],
    easing: 'cubicBezier(0.25, 0.1, 0.25, 1.0)',
    duration: 800,
    delay: anime.stagger(30, { start: 200 }),
  });
}

// Honey drip SVG path animation
export function honeyDrip(svgElement: HTMLElement) {
  return anime({
    targets: svgElement.querySelectorAll('.drip-path'),
    strokeDashoffset: [anime.setDashoffset, 0],
    easing: 'cubicBezier(0.65, 0, 0.35, 1)',
    duration: 2000,
    delay: anime.stagger(150),
  });
}

// Honeycomb grid entrance
export function honeycombEntrance(container: HTMLElement) {
  return anime({
    targets: container.querySelectorAll('.hex-cell'),
    scale: [0, 1],
    opacity: [0, 1],
    easing: 'cubicBezier(0.16, 1, 0.3, 1)',
    duration: 600,
    delay: anime.stagger(50, { grid: [5, 3], from: 'center' }),
  });
}

// Counter animation
export function animateCounter(target: HTMLElement, endValue: number) {
  return anime({
    targets: { value: 0 },
    value: endValue,
    round: 1,
    easing: 'cubicBezier(0.25, 0.1, 0.25, 1.0)',
    duration: 2000,
    update: (anim) => {
      target.textContent = Math.round((anim.animations[0] as any).currentValue).toLocaleString('en-IN');
    },
  });
}
```

### Animation Rules

1. **Always wrap animations in `prefers-reduced-motion` check.** If user prefers reduced motion, show content immediately with no animation.
```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

2. **Trigger animations on scroll** using Intersection Observer (via `useInView` hook or Framer Motion's `whileInView`). Never auto-play animations above the fold that block content visibility for more than 0.5s.

3. **Duration rules:**
   - Micro-interactions (hover, click): 200–350ms
   - Element entrances: 600–900ms
   - Page transitions: 400–600ms
   - Hero sequence: up to 2500ms total (but content readable by 800ms)
   - SVG path draws: 1500–2500ms

4. **Never animate layout properties** (width, height, top, left). Always use `transform` and `opacity` for 60fps.

5. **Stagger rule:** max 8 items in a stagger group. Beyond 8, show in batches.

### Smooth Scrolling (Lenis)

```typescript
// src/components/shared/LenisProvider.tsx
'use client';
import { ReactLenis } from 'lenis/react';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,          // Smooth, honey-like scroll feel
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 0.8, // Slightly slower scroll = luxurious feel
      }}
    >
      {children}
    </ReactLenis>
  );
}
```

### Custom Cursor (Desktop Only)

A small golden dot that follows the mouse with a slight lag. Expands on hoverable elements. Hidden on mobile/tablet.

```typescript
// Behavior:
// - Default: 8px golden circle (#F5A623), mix-blend-mode: difference
// - On hover (links, buttons, cards): expands to 48px with "VIEW" / "SHOP" / "DRAG" text
// - On product images: crosshair-style expand with "ZOOM" text
// - Use framer motion spring for smooth follow
// - Detect touch device → hide entirely
```

---

## 6. PAGE-BY-PAGE BUILD SPECS

### 6.1 HOMEPAGE (`/`)

The homepage is the brand's first impression. It should feel immersive, like you're being dipped in honey.

**Scroll Sequence (top to bottom):**

#### Section 1: Hero (100vh)
- **Background:** Warm gradient (#FFFDF8 → #FFF0D6) with subtle honeycomb SVG pattern at 3% opacity
- **Left side (60%):** Headline text with anime.js character reveal:
  ```
  Line 1: "Nature's" (Bespoke Serif italic, --honey-400)
  Line 2: "Golden" (Clash Display bold, --charcoal)
  Line 3: "Promise" (Clash Display bold, --charcoal)
  ```
  Below headline: Subtext (Satoshi, --earth) "Raw, unprocessed honey sourced from India's wildest apiaries. From hive to home, nothing added, nothing taken."
  Below subtext: Two CTAs — "Shop Collection" (primary honey button) + "Our Story" (text link with arrow)
- **Right side (40%):** Hero product image — large honey jar with floating honey drip animation. Use a high-quality product shot with Framer Motion `float` animation (gentle Y oscillation, 4s duration, infinite). Golden particle effect (CSS) behind the jar.
- **Bottom of hero:** Scroll indicator — animated chevron bouncing down with "Scroll to explore" text (Satoshi, --earth-light, text-micro)

#### Section 2: Marquee Banner
- Full-width horizontal scrolling text marquee (infinite, CSS animation, 30s duration)
- Text: "RAW HONEY • WILD SOURCED • UNPROCESSED • SINGLE ORIGIN • WESTERN GHATS • SUNDARBANS • HIMALAYAN • PURE NATURE •"
- Font: Clash Display, 1.5rem, --honey-400, uppercase, letter-spacing: 0.2em
- Background: --honey-100
- Scroll direction: right-to-left
- On hover: pause animation

#### Section 3: Featured Products (horizontal scroll)
- Section title: "The Collection" (Clash Display) with anime.js text reveal on scroll
- Subtitle: "Taste the terroir" (Bespoke Serif italic, --earth)
- **Horizontal scroll carousel** using Embla Carousel:
  - Cards are 340px wide, 480px tall on desktop
  - Each card: product image (top 60%), product name + price + "Quick Add" button (bottom 40%)
  - Card hover: image scales 1.05, subtle golden shadow appears, "Quick Add" slides up from bottom
  - Show 3.5 cards visible (half card = scroll hint)
  - Drag to scroll on mobile, arrow buttons on desktop
  - Each card enters with Framer Motion `scaleIn` variant as carousel scrolls into view

#### Section 4: Brand Story Strip
- Full-width, split layout: image left (50%), text right (50%)
- Image: Honey being poured in golden light (parallax on scroll — moves at 0.85x speed)
- Text side:
  - Eyebrow: "OUR STORY" (Satoshi, uppercase, letter-spacing: 0.15em, --honey-400)
  - Headline: "From Wild Hives to Your Table" (Clash Display, --charcoal)
  - Body: 2-3 paragraphs about SUMOSTA's sourcing (Satoshi, --bark)
  - CTA: "Learn More →" (text link)
- Entire section fades up on scroll

#### Section 5: Category Grid
- Section title: "Explore by Type" (Clash Display)
- Grid: 3 columns on desktop, asymmetric sizes
  - Cell 1 (spans 2 rows): "Honey Sticks" — tall card with image overlay + title
  - Cell 2: "Raw Honey" — standard card
  - Cell 3: "Honey Spreads" — standard card
  - Cell 4 (spans 2 cols): "Gift Boxes" — wide card
- Each card:
  - Full-bleed image with dark gradient overlay (bottom 40%)
  - Category name in Clash Display white, bottom-left
  - On hover: image scale 1.08 (slow, 800ms), overlay lightens, golden border appears
  - On hover: text shifts up 8px, "Shop →" appears below
  - Entry: staggered scaleIn on scroll

#### Section 6: "The Process" — Scroll-Driven Storytelling
- **This is the signature section.** A horizontal-scroll-within-vertical-scroll experience.
- As user scrolls vertically, content scrolls horizontally through 4 stages:
  1. "Sourced Wild" — Image of forest/apiaries + text
  2. "Harvested with Care" — Beekeeper image + text
  3. "Tested for Purity" — Lab/testing image + text
  4. "Sealed for You" — Packaging/jar image + text
- Implementation: Use `position: sticky` container with `translateX` driven by scroll progress (Framer Motion `useScroll` + `useTransform`)
- Each stage has a large number (01, 02, 03, 04) in Clash Display at 20vw size, --honey-100 color (background watermark)
- Progress indicator: thin golden line at top that fills left-to-right as user scrolls
- On mobile: convert to standard vertical scroll with each stage as a full-width card

#### Section 7: Testimonials
- Section title: "What Our Customers Say" (Clash Display)
- Carousel (Embla) of testimonial cards
- Each card: large quotation mark (Bespoke Serif, --honey-200, 4rem), review text, customer name + location
- Background: --cream-warm
- Auto-play (5s interval), pause on hover

#### Section 8: Instagram / Social Proof
- Section title: "Follow the Hive" (Clash Display) + "@sumosta" link
- Grid of 6 images (3x2 on desktop, 2x3 on mobile)
- Hover: golden overlay with Instagram icon
- These can be placeholder images initially

#### Section 9: Newsletter
- Full-width section with honeycomb SVG pattern background (--honey-50)
- Headline: "Join the Colony" (Clash Display, --charcoal)
- Subtext: "Get first access to new harvests, exclusive recipes, and 10% off your first order."
- Email input + "Subscribe" button (inline on desktop, stacked on mobile)
- Animated bee SVG that flies across on section entry (anime.js path animation) — subtle, 3s, once

#### Section 10: Footer
- Background: --midnight
- Layout: 4-column grid
  - Col 1: SUMOSTA logo + tagline + social icons
  - Col 2: Shop (All Products, Honey Sticks, Spreads, Gift Boxes, New Arrivals)
  - Col 3: Company (Our Story, Sourcing, Sustainability, Blog, Contact)
  - Col 4: Help (Track Order, Shipping Policy, Returns, FAQ, Privacy Policy)
- Bottom bar: © 2024 SUMOSTA + Payment icons (UPI, Visa, Mastercard, Rupay)
- All text: --earth-light, links hover → --honey-300

---

### 6.2 PRODUCT LISTING PAGE (`/shop`)

- **Top:** Page title "The Collection" + breadcrumbs + result count
- **Filter bar** (sticky on scroll):
  - Category pills (horizontal scroll on mobile): All, Raw Honey, Honey Sticks, Spreads, Gift Boxes
  - Sort dropdown: Featured, Price Low→High, Price High→Low, Newest
  - Mobile: filter icon opens bottom sheet
- **Product Grid:**
  - 4 columns desktop / 2 columns mobile
  - Animated grid layout — products enter with staggered `fadeUp` on initial load
  - Changing filters: products exit (scale down + fade), new ones enter (scale up + fade) using `AnimatePresence`
- **Pagination:** "Load More" button (not numbered pages) with loading animation (HoneycombLoader)
- **Empty state:** Illustration of empty honey jar + "No products found" + "Clear filters" CTA

### 6.3 PRODUCT DETAIL PAGE (`/product/[slug]`)

- **Layout:** 2-column on desktop (50/50), single column mobile
- **Left column — Image Gallery:**
  - Main image: large, rounded-xl, cream background
  - Thumbnail strip below (horizontal scroll)
  - Click main image → full-screen lightbox with zoom (Framer Motion `layoutId` for smooth expand)
  - Image transitions: crossfade on thumbnail click
- **Right column — Product Info:**
  - Breadcrumbs (small, --earth-light)
  - Product name (Clash Display, text-title, --charcoal)
  - Price: "₹599" (Clash Display, --honey-500, text-heading). If compare_at: show "~~₹799~~" crossed out in --earth-light
  - Star rating (filled golden stars SVG) + review count link
  - Short description (Satoshi, --bark)
  - **Variant selector** (if applicable): visual swatches for flavor, size dropdown for quantity
  - **Quantity selector:** +/- buttons with number, golden border
  - **Add to Cart button:** Full width, --honey-400 bg, Clash Display text. On click: button morphs — text changes to "Added ✓" with check animation, then reverts after 2s. Cart icon in navbar gets a bounce + count badge update.
  - **Additional info accordion:**
    - "Description" — full product description
    - "Ingredients & Nutrition" — table
    - "Shipping & Returns" — policy summary
    - "How to Use" — usage suggestions
  - **Trust badges row:** "100% Raw" + "Lab Tested" + "Free Shipping 500+" icons
- **Below fold:**
  - "You Might Also Like" — 4-product carousel (reuse ProductCard)
  - "Reviews" — review list + "Write a Review" form (authed only)

### 6.4 CART PAGE (`/cart`)

- **Layout:** 2-column (items left 65%, summary right 35%). Single column mobile.
- **Cart items:** Each item is a card with: image thumbnail, product name + variant, unit price, quantity adjuster (+/-), line total, remove button (X with confirm)
- **Quantity change:** animate the line total number (anime.js counter)
- **Cart summary:**
  - Subtotal
  - Coupon input with "Apply" button (validates via API, shows green success or red error inline)
  - Discount line (if coupon applied)
  - Shipping: "Calculated at checkout" or "FREE" if over ₹500
  - **Total** (large, Clash Display)
  - "Proceed to Checkout" button (full-width honey CTA)
- **Empty cart:** Animated honey jar tipping over (Lottie/CSS), "Your cart is empty" + "Continue Shopping" link
- **Animation:** removing an item → item slides left and fades out, remaining items smooth-reflow (Framer Motion `layout` prop)

### 6.5 CHECKOUT PAGE (`/checkout`)

- **Layout:** 2-column (form left 60%, summary right 40%). Single column mobile (summary collapsible at top).
- **Steps:** Single-page form, NOT multi-step wizard. Sections:
  1. Contact info (email, phone — pre-filled if logged in)
  2. Shipping address (name, address line 1, line 2, city, state dropdown, pincode — auto-detect city/state from pincode via API)
  3. Order summary (collapsed, expandable, shows items + totals)
  4. Coupon code input (if not already applied from cart)
  5. Payment section: "Pay with PhonePe" button (PhonePe branded, leads to redirect)
- **Form validation:** React Hook Form + Zod. Inline errors below each field. Real-time pincode validation.
- **Pay button:** PhonePe logo + "Pay ₹{total}" — loading state with HoneycombLoader
- **Cloudflare Turnstile** widget above pay button (invisible mode preferred, fallback to managed)

### 6.6 ORDER CONFIRMATION (`/order-confirmation/[id]`)

- **Animation:** On load, a check mark draws itself (anime.js SVG path), golden confetti particles burst (simple CSS/anime.js)
- **Content:**
  - "Order Confirmed!" (Clash Display)
  - Order number: SUMO-XXXXXX
  - Estimated delivery date
  - Order summary (items, totals)
  - Shipping address
  - "Continue Shopping" + "Track Order" buttons
- **Email:** Triggered server-side — order confirmation with items, total, estimated delivery

### 6.7 ABOUT PAGE (`/about`)

- **Hero:** Full-width image (Western Ghats landscape) with parallax, overlay text: "Our Story" (Clash Display, white)
- **Content:** Long-form editorial layout:
  - Alternating image-text sections (image left/right flip)
  - Pull quotes in Bespoke Serif italic
  - Stats section: "5000+ Happy Customers" / "12 Apiaries" / "Zero Additives" / "100% Traceable" with anime.js counter animation on scroll
  - Team/founder section
- **Animation:** Each section reveals with fadeUp on scroll, images with slight parallax

### 6.8 AUTH PAGES (`/auth/*`)

- **Layout:** Centered card (max-w-md) on cream background with subtle honeycomb pattern
- **Login:** Email + password + "Remember me" + "Forgot password?" link + Submit + "or Register" link
- **Register:** Name + email + phone + password + confirm password + Submit + "or Login" link
- **Forgot Password:** Email input + Submit → success message
- **Style:** Clean, minimal. Form inputs with golden focus border. Submit button is honey CTA.

---

## 7. COMPONENT LIBRARY

### AnimatedText (anime.js text reveal)

```typescript
// Split text into individual characters wrapped in spans
// On mount / when inView, run anime.js stagger animation
// Props: text, tag ('h1'|'h2'|'p'), className, delay, splitBy ('char'|'word'|'line')
// Uses: Hero headline, section titles
// MUST handle prefers-reduced-motion (show instantly)
```

### MagneticButton

```typescript
// On mouse move within button bounds, button translates slightly toward cursor (max 8px)
// On mouse leave, springs back with honeySpring transition
// Uses Framer Motion useMotionValue + useTransform
// Props: children, className, strength (default 0.3)
// Apply to: primary CTAs, nav links on desktop
// On mobile/touch: disable magnetic effect entirely
```

### RevealOnScroll

```typescript
// Wrapper component that animates children when entering viewport
// Uses Framer Motion whileInView + variants
// Props: children, variant (fadeUp|fadeIn|scaleIn|slideInLeft|slideInRight), delay, className, once (default true)
// threshold: 0.2 (trigger when 20% visible)
```

### ProductCard

```typescript
// Props: product (Product type), index (for stagger delay)
// Structure:
//   - Image container (aspect-[3/4], overflow-hidden, rounded-lg)
//     - Product image (fills container, object-cover)
//     - On hover: image scales 1.05 (600ms), "Quick View" overlay fades in from bottom
//     - Sale badge (absolute, top-right): "--% OFF" in terracotta
//     - Out of stock overlay if stock === 0
//   - Below image:
//     - Category label (text-micro, uppercase, --earth-light)
//     - Product name (Satoshi semibold, --charcoal, line-clamp-2)
//     - Price row: current price (--honey-500) + compare_at crossed out
//     - Star rating (small)
//   - "Add to Cart" button appears on card hover (slides up from bottom, Framer Motion)
// Click anywhere on card (except Add to Cart) → navigates to PDP
```

### HoneycombLoader

```typescript
// 7 hexagons arranged in honeycomb pattern
// Each hexagon pulses golden (opacity 0.3 → 1) with stagger from center
// anime.js stagger grid animation, loops infinitely
// Size: small (32px), medium (48px), large (64px)
// Used for: page loads, button loading states, skeleton placeholders
```

### GoldenDivider

```typescript
// SVG decorative divider — a thin line with a honey drip in the center
// Draws itself on scroll entry (anime.js strokeDashoffset)
// Width: 200px, centered
// Use between major sections as visual break
```

### PageTransition

```typescript
// Wraps page content in AnimatePresence + motion.div
// Entry: fade in + slide up 20px (500ms)
// Exit: fade out (300ms)
// Uses pageTransition variants from animations.ts
// Applied in each page.tsx as the outermost wrapper
```

### CartDrawer

```typescript
// Slide-in drawer from right (Framer Motion)
// Opens on "Add to Cart" click or cart icon click
// Shows: mini cart items, subtotal, "View Cart" + "Checkout" buttons
// Overlay behind (--overlay) with click-to-close
// Item removal: swipe left on mobile, X button on desktop
// Empty state: "Your cart is empty" + "Shop Now" button
```

---

## 8. BACKEND API

### Hono App Setup

```typescript
// apps/api/src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  KV_SESSIONS: KVNamespace;
  KV_CACHE: KVNamespace;
  ANALYTICS: AnalyticsEngineDataset;
  PHONEPE_MERCHANT_ID: string;
  PHONEPE_SALT_KEY: string;
  PHONEPE_SALT_INDEX: string;
  PHONEPE_ENV: string;
  JWT_SECRET: string;
  RESEND_API_KEY: string;
  BASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors({ origin: ['https://sumosta.com', 'http://localhost:3000'] }));
app.use('*', logger());
// ... mount routes
export default app;
```

### API Route Specifications

**GET /api/products**
```
Query params: category, sort (price_asc, price_desc, newest, featured), page, limit (default 12), search
Response: { products: Product[], total: number, page: number, totalPages: number }
Cache: KV_CACHE with key "products:{hash_of_params}", TTL 300s
```

**GET /api/products/:slug**
```
Response: Product with images[], variants[], reviews[], relatedProducts[]
Cache: KV_CACHE with key "product:{slug}", TTL 300s, bust on admin edit
```

**POST /api/auth/register**
```
Body: { name, email, phone, password }
Validation: email format, phone 10 digits, password 8+ chars
Hash password with bcrypt (10 rounds)
Generate JWT (15min) + refresh token (7d, stored in KV)
Response: { user, accessToken, refreshToken }
Set refreshToken as httpOnly cookie
```

**POST /api/auth/login**
```
Body: { email, password }
Verify bcrypt hash
Generate JWT + refresh token
Response: { user, accessToken, refreshToken }
```

**POST /api/cart/items**
```
Body: { productId, variantId?, quantity }
Cart stored in KV: key = "cart:{sessionId}", value = JSON cart object
If user logged in, merge guest cart into user cart
Response: { cart: CartItem[] }
```

**POST /api/checkout**
```
Body: { shippingAddress, couponCode?, items (from cart) }
Auth: required (customer JWT)
Steps:
  1. Validate cart items exist and have stock
  2. Calculate totals (subtotal, discount, shipping, tax)
  3. Create order in D1 (status=pending, payment_status=pending)
  4. Initiate PhonePe payment (see section 10)
  5. Return { orderId, paymentUrl }
Frontend redirects to paymentUrl
```

**POST /api/payments/phonepe/callback**
```
PhonePe S2S callback (see section 10 for full implementation)
Verify X-VERIFY checksum
Update order payment_status
Deduct stock
Send confirmation email
Return 200
```

**POST /api/analytics/event**
```
Body: { eventType, eventData, pageUrl, sessionId }
Write to Analytics Engine
Also batch-insert to D1 analytics_events (for backup)
No auth required (public endpoint)
Rate limit: 60/min per IP
```

### Admin API

All admin routes require JWT with role='admin' or role='superadmin'.

**GET /api/admin/dashboard**
```
Response: {
  today: { revenue, orders, aov, visitors },
  yesterday: { revenue, orders, aov, visitors },
  thisMonth: { revenue, orders, aov, visitors },
  recentOrders: Order[] (last 10),
  lowStockProducts: Product[] (stock < threshold),
  topProducts: { productId, name, revenue, units }[] (top 5, this month)
}
```

**GET /api/admin/analytics/overview**
```
Query: period (7d, 30d, 90d, custom), startDate?, endDate?
Response: {
  revenue: { current, previous, change% },
  orders: { current, previous, change% },
  aov: { current, previous, change% },
  visitors: { current, previous, change% },
  conversionRate: { current, previous, change% },
  revenueChart: { date, revenue }[],
  ordersChart: { date, orders }[],
  trafficChart: { date, visitors, pageviews }[],
  topSources: { source, visitors, revenue }[],
  topProducts: { name, units, revenue }[],
  geoBreakdown: { country, state, city, visitors }[]
}
```

### Middleware Stack

```
Every request:
  1. CORS
  2. Logger (method, path, status, latency)
  3. Rate limiter (KV-based, per IP)
  4. Analytics logger (write to Analytics Engine)

Auth-required routes additionally:
  5. JWT verification (from Authorization: Bearer header)
  6. User lookup from D1

Admin routes additionally:
  7. Role check (admin or superadmin)
```

---

## 9. DATABASE SCHEMA

Use the full schema from the architecture plan (section 4 of the architecture document). Additionally add:

```sql
-- Addresses (saved customer addresses)
CREATE TABLE addresses (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    phone       TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city        TEXT NOT NULL,
    state       TEXT NOT NULL,
    pincode     TEXT NOT NULL,
    is_default  INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
);

-- Newsletter subscribers
CREATE TABLE subscribers (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    is_active   INTEGER DEFAULT 1,
    source      TEXT DEFAULT 'website',
    created_at  TEXT DEFAULT (datetime('now'))
);

-- Contact form submissions
CREATE TABLE contact_messages (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    phone       TEXT,
    subject     TEXT,
    message     TEXT NOT NULL,
    is_read     INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
);

-- Daily aggregated metrics (populated by cron worker)
CREATE TABLE daily_metrics (
    date            TEXT NOT NULL,
    metric_name     TEXT NOT NULL,
    dimension_key   TEXT DEFAULT 'total',
    dimension_value TEXT DEFAULT 'all',
    value           REAL NOT NULL,
    PRIMARY KEY (date, metric_name, dimension_key, dimension_value)
);

-- Admin activity log
CREATE TABLE admin_logs (
    id          TEXT PRIMARY KEY,
    admin_id    TEXT NOT NULL REFERENCES users(id),
    action      TEXT NOT NULL,
    entity_type TEXT,
    entity_id   TEXT,
    details     TEXT,              -- JSON
    created_at  TEXT DEFAULT (datetime('now'))
);
```

### Seed Data

Create seed.sql with:
- 1 superadmin user (email: admin@sumosta.com, password: hashed "admin123" — change on first login)
- 5 categories: Raw Honey, Honey Sticks, Honey Spreads, Honeycomb, Gift Boxes
- 15-20 products across categories with realistic names, descriptions, prices:
  - "Western Ghats Raw Honey" — ₹599 (500g), ₹999 (1kg)
  - "Himalayan Wild Honey" — ₹699 (500g)
  - "Sundarbans Mangrove Honey" — ₹549 (500g)
  - "Classic Honey Sticks — 10 Pack" — ₹199
  - "Assorted Flavor Honey Sticks — 20 Pack" — ₹449
  - "Cinnamon Honey Spread" — ₹399 (250g)
  - "Vanilla Bean Honey Spread" — ₹399 (250g)
  - "Cardamom Honey Spread" — ₹399 (250g)
  - "Turmeric Golden Honey Spread" — ₹449 (250g)
  - "Raw Honeycomb Piece" — ₹799 (250g)
  - "The Essentials Gift Box" — ₹1,499 (3 jars)
  - "The Connoisseur Gift Box" — ₹2,999 (5 jars + honeycomb + sticks)
  - etc.
- 2 coupons: WELCOME10 (10% off, first order), HONEY20 (₹200 off on ₹1000+)

---

## 10. PHONEPE PAYMENT INTEGRATION

### Environment Configuration

```
# Sandbox (development)
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_MERCHANT_ID=PGTESTPAYUAT86      # PhonePe sandbox merchant ID
PHONEPE_SALT_KEY=96434309-7796-489d-8924-ab56988a6076  # Sandbox salt
PHONEPE_SALT_INDEX=1

# Production (switch on launch day)
PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
PHONEPE_MERCHANT_ID=<real_merchant_id>
PHONEPE_SALT_KEY=<real_salt_key>
PHONEPE_SALT_INDEX=1
```

### Payment Service

```typescript
// apps/api/src/services/phonepe.ts
import { createHash } from 'node:crypto';

interface PhonePePayRequest {
  merchantId: string;
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number;         // in paise
  redirectUrl: string;
  redirectMode: 'REDIRECT';
  callbackUrl: string;
  paymentInstrument: { type: 'PAY_PAGE' };
}

export class PhonePeService {
  constructor(
    private merchantId: string,
    private saltKey: string,
    private saltIndex: string,
    private baseUrl: string,
  ) {}

  // Generate SHA256 checksum
  private generateChecksum(payload: string, endpoint: string): string {
    const data = payload + endpoint + this.saltKey;
    const hash = createHash('sha256').update(data).digest('hex');
    return hash + '###' + this.saltIndex;
  }

  // Initiate payment
  async initiatePayment(params: {
    orderId: string;
    userId: string;
    amount: number;       // in INR (rupees, not paise)
    redirectUrl: string;
    callbackUrl: string;
  }) {
    const merchantTransactionId = `SUMO${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const payload: PhonePePayRequest = {
      merchantId: this.merchantId,
      merchantTransactionId,
      merchantUserId: params.userId,
      amount: Math.round(params.amount * 100), // Convert to paise
      redirectUrl: params.redirectUrl,
      redirectMode: 'REDIRECT',
      callbackUrl: params.callbackUrl,
      paymentInstrument: { type: 'PAY_PAGE' },
    };

    const base64Payload = btoa(JSON.stringify(payload));
    const checksum = this.generateChecksum(base64Payload, '/pg/v1/pay');

    const response = await fetch(`${this.baseUrl}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(`PhonePe init failed: ${data.message}`);
    }

    return {
      merchantTransactionId,
      paymentUrl: data.data.instrumentResponse.redirectInfo.url,
    };
  }

  // Verify callback
  verifyCallback(xVerifyHeader: string, responseBody: string): boolean {
    const expectedChecksum = this.generateChecksum(responseBody, '/pg/v1/pay');
    return xVerifyHeader === expectedChecksum;
  }

  // Check payment status
  async checkStatus(merchantTransactionId: string) {
    const endpoint = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}`;
    const checksum = this.generateChecksum('', endpoint);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': this.merchantId,
      },
    });

    return response.json();
  }

  // Initiate refund
  async initiateRefund(params: {
    originalTransactionId: string;
    amount: number;       // in INR
  }) {
    const refundId = `REF${Date.now()}`;
    const payload = {
      merchantId: this.merchantId,
      merchantUserId: 'SYSTEM',
      merchantTransactionId: refundId,
      originalTransactionId: params.originalTransactionId,
      amount: Math.round(params.amount * 100),
    };

    const base64Payload = btoa(JSON.stringify(payload));
    const checksum = this.generateChecksum(base64Payload, '/pg/v1/refund');

    const response = await fetch(`${this.baseUrl}/pg/v1/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    return response.json();
  }
}
```

### Callback Handler

```typescript
// POST /api/payments/phonepe/callback
// This is called S2S by PhonePe — not by the browser
// CRITICAL: This handler must be idempotent (PhonePe may call it multiple times)

app.post('/api/payments/phonepe/callback', async (c) => {
  const body = await c.req.json();
  const xVerify = c.req.header('X-VERIFY');

  // 1. Verify checksum
  // 2. Decode base64 response
  // 3. Extract merchantTransactionId and status
  // 4. Look up order by phonepe_merchant_txn_id
  // 5. If order already confirmed (idempotency check), return 200
  // 6. If payment SUCCESS:
  //    - Update order: payment_status='captured', status='confirmed', paid_at=now
  //    - Deduct stock for each order item
  //    - Send confirmation email via Resend
  // 7. If payment FAILED:
  //    - Update order: payment_status='failed'
  // 8. Return 200 (always, even on failure — PhonePe expects 200)
});
```

---

## 11. ANALYTICS & TRACKING

### Client-Side Tracker

```typescript
// src/lib/tracker.ts
// Lightweight tracker — no dependencies, ~1.5KB

class SumostaTracker {
  private sessionId: string;
  private queue: Event[] = [];

  constructor() {
    this.sessionId = this.getOrCreateSession();
    this.setupPageView();
    this.setupScrollDepth();
    this.flushInterval();
  }

  track(eventType: string, data: Record<string, any> = {}) {
    this.queue.push({
      eventType,
      eventData: data,
      pageUrl: window.location.pathname,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      referrer: document.referrer,
    });

    // Flush when queue hits 5 events or immediately for critical events
    if (this.queue.length >= 5 || ['purchase', 'add_to_cart', 'begin_checkout'].includes(eventType)) {
      this.flush();
    }
  }

  private async flush() {
    if (this.queue.length === 0) return;
    const events = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
        keepalive: true,     // survives page unload
      });
    } catch {
      this.queue.unshift(...events); // re-queue on failure
    }
  }
}

export const tracker = typeof window !== 'undefined' ? new SumostaTracker() : null;
```

### Events to Track

```typescript
// Homepage
tracker.track('page_view', { page: 'home' });

// Product listing
tracker.track('page_view', { page: 'shop', category, sort, filters });

// Product detail
tracker.track('product_view', { productId, productName, price, category });

// Add to cart (fire from cart store)
tracker.track('add_to_cart', { productId, productName, price, quantity, variant });

// Remove from cart
tracker.track('remove_from_cart', { productId, productName });

// Begin checkout
tracker.track('begin_checkout', { cartTotal, itemCount, couponCode });

// Purchase (fire on order confirmation page)
tracker.track('purchase', { orderId, total, items: [...], couponCode, paymentMethod });

// Search
tracker.track('search', { query, resultCount });

// Coupon applied
tracker.track('coupon_applied', { code, discountAmount, success: boolean });

// Newsletter signup
tracker.track('newsletter_signup', { source: 'footer' | 'popup' | 'checkout' });

// Scroll depth (25%, 50%, 75%, 100%)
tracker.track('scroll_depth', { depth: 25, page: 'home' });
```

### Server-Side (Analytics Engine)

Every API request automatically logs to Cloudflare Analytics Engine via middleware. The admin analytics endpoints query this data using the Analytics Engine SQL API for real-time dashboards.

### Daily Aggregation Cron

```typescript
// Scheduled Cloudflare Worker (cron: "0 18 * * *" = midnight IST)
// Queries Analytics Engine for yesterday's data
// Computes and inserts into daily_metrics table:
//   - revenue, orders, aov, unique_visitors, page_views
//   - revenue_by_category, revenue_by_source
//   - top_products (by revenue, by units)
//   - conversion_rate (purchases / unique_visitors)
//   - cart_abandonment_rate
//   - new_vs_returning customers
```

---

## 12. ADMIN PANEL

### Design Direction

The admin panel uses a **different design language** from the storefront. Clean, data-dense, functional.

- **Background:** white (#FFFFFF) — yes, pure white is fine for admin
- **Sidebar:** --midnight bg, --cream text, --honey-400 active indicator
- **Font:** Satoshi only (no Clash Display or Bespoke Serif in admin)
- **Components:** shadcn/ui exclusively (Button, Input, Select, Table, Dialog, Tabs, Card, Badge, Toast, DropdownMenu, Sheet, Tooltip)
- **Charts:** Recharts with honey color palette
- **Tables:** DataTable component wrapping Tanstack Table (sorting, filtering, pagination, row selection)
- **No custom animations** in admin (use Tailwind transitions only). Speed and clarity over aesthetics.

### Dashboard (`/admin`)

```
┌─────────────────────────────────────────────────────────────────┐
│  SUMOSTA Admin          [Search]           [🔔] [Admin ▾]       │
├──────────┬──────────────────────────────────────────────────────┤
│ Dashboard│  Welcome back, Admin                                 │
│ Orders   │                                                      │
│ Products │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ Categories│ │₹12,450  │ │ 23      │ │ ₹541    │ │ 156     │   │
│ Customers│ │Revenue  ↑│ │Orders  ↑│ │AOV     ↓│ │Visitors↑│   │
│ Coupons  │ │+18% vs  │ │+12% vs │ │-3% vs  │ │+24% vs │   │
│ Reviews  │ │yesterday │ │yesterday│ │yesterday│ │yesterday│   │
│ Analytics│ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│  Overview│                                                      │
│  Sales   │  ┌──────────────────────────────────────────────┐   │
│  Traffic │  │  Revenue (Last 30 Days)         [7d][30d][90d]│   │
│  Funnel  │  │  ████████████████████████████████             │   │
│  Products│  │  Chart (Recharts AreaChart)                    │   │
│  Customers│ └──────────────────────────────────────────────┘   │
│ Media    │                                                      │
│ Settings │  ┌───────────────────┐  ┌───────────────────────┐   │
│          │  │ Recent Orders     │  │ Low Stock Alerts       │   │
│          │  │ SUMO-001 ₹1,299 ◉│  │ Honey Sticks — 3 left │   │
│          │  │ SUMO-002 ₹599   ◉│  │ Cardamom Spread — 5   │   │
│          │  │ ...               │  │ ...                    │   │
│          │  └───────────────────┘  └───────────────────────┘   │
└──────────┴──────────────────────────────────────────────────────┘
```

### Product Form Fields

When creating/editing a product, the form includes:
- Basic: Name, slug (auto-generated from name), SKU, category (dropdown)
- Pricing: Price (₹), Compare-at price, Cost price (for margin calc)
- Description: Short description (textarea), Full description (rich text editor — use a simple markdown editor, not a full WYSIWYG)
- Images: Drag-and-drop multi-image uploader (uploads to R2), reorder by drag, set primary image, alt text per image
- Variants: Dynamic variant rows — each row has: variant name, SKU, price adjustment, stock
- Inventory: Stock count, low stock threshold
- Shipping: Weight (grams)
- SEO: Meta title, meta description
- Tags: Comma-separated tags
- Status: Active/Draft toggle, Featured toggle

### Analytics Dashboard Specs

**Conversion Funnel (`/admin/analytics/funnel`):**
```
Visitors (1,245)
    │ ████████████████████████████████████████ 100%
    ▼
Product Views (876)
    │ ██████████████████████████████           70.4%
    ▼
Add to Cart (234)
    │ ████████                                 18.8%
    ▼
Checkout Started (156)
    │ ██████                                   12.5%
    ▼
Purchase (89)
    │ ████                                      7.1%

Cart Abandonment Rate: 62% (people who added but didn't buy)
Checkout Abandonment: 43% (people who started checkout but didn't pay)
```

Use a vertical funnel chart (Recharts FunnelChart or custom SVG) with each step showing the count and percentage. Color gradient from --honey-200 (top) to --honey-600 (bottom).

**Traffic Sources (`/admin/analytics/traffic`):**
- Pie chart: Direct, Organic Search, Social, Referral, UTM Campaign
- Table below: Source / Medium / Visitors / Bounce Rate / Revenue
- Map visualization (India map with state-level heat coloring) — use a simple SVG India map with D3 coloring

**Customer Cohorts (`/admin/analytics/customers`):**
- Monthly cohort retention table (rows = signup month, columns = months since signup, cells = % returning)
- LTV histogram (Recharts BarChart)
- New vs Returning pie chart

---

## 13. INFRASTRUCTURE & DEPLOYMENT

### Cloudflare Setup

```toml
# apps/api/wrangler.toml
name = "sumosta-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
BASE_URL = "https://sumosta.com"

[[d1_databases]]
binding = "DB"
database_name = "sumosta-db"
database_id = "<get from wrangler d1 create>"

[[r2_buckets]]
binding = "R2"
bucket_name = "sumosta-assets"

[[kv_namespaces]]
binding = "KV_SESSIONS"
id = "<get from wrangler kv namespace create>"

[[kv_namespaces]]
binding = "KV_CACHE"
id = "<get from wrangler kv namespace create>"

[[analytics_engine_datasets]]
binding = "ANALYTICS"
dataset = "sumosta_events"

# Daily metrics cron job
[triggers]
crons = ["0 18 * * *"]    # 18:00 UTC = 23:30 IST

# Secrets (set via wrangler secret put):
# PHONEPE_MERCHANT_ID, PHONEPE_SALT_KEY, PHONEPE_SALT_INDEX, PHONEPE_ENV
# JWT_SECRET, REFRESH_TOKEN_SECRET, RESEND_API_KEY
```

### Cloudflare Pages Config

```
Build command: cd apps/web && pnpm build
Build output: apps/web/.next
Root directory: /
Environment variables:
  NEXT_PUBLIC_API_URL = https://api.sumosta.com (or Workers route)
  NEXT_PUBLIC_SITE_URL = https://sumosta.com
```

### DNS Setup

```
sumosta.com        → Cloudflare Pages (CNAME)
api.sumosta.com    → Cloudflare Workers (Workers Route or custom domain)
assets.sumosta.com → R2 bucket (custom domain for public assets)
```

### Cloudflare Page Rules / Transform Rules

```
# Force HTTPS
# Cache static assets (images, fonts, JS, CSS) for 1 year
# Cache HTML pages for 5 minutes (edge)
# Bypass cache for /api/* routes
# Enable Image Resizing on assets.sumosta.com
```

---

## 14. CODE STANDARDS & CONVENTIONS

### TypeScript

- Strict mode enabled (`"strict": true` in tsconfig)
- No `any` types — use `unknown` and narrow, or define proper types
- All API responses typed with shared types from `packages/shared`
- Use Zod schemas for runtime validation (shared between frontend and API)

### Naming

```
Files:           kebab-case (product-card.tsx, use-cart.ts)
Components:      PascalCase (ProductCard, HeroSection)
Hooks:           camelCase with "use" prefix (useCart, useAnime)
Utils:           camelCase (formatPrice, generateSlug)
Types:           PascalCase (Product, Order, CartItem)
CSS classes:     Tailwind utilities only — no custom class names except in globals.css
API routes:      kebab-case (/api/admin/order-items)
DB columns:      snake_case (created_at, payment_status)
Env vars:        SCREAMING_SNAKE (PHONEPE_SALT_KEY)
```

### Component Pattern

```typescript
// Every component follows this structure:
'use client'; // Only if it uses hooks, state, or browser APIs

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  // hooks first
  // derived state / computations
  // handlers
  // return JSX
}
```

### Import Order

```typescript
// 1. React / Next.js
// 2. Third-party libraries (framer-motion, animejs, zustand)
// 3. Internal components (@/components/...)
// 4. Internal hooks (@/hooks/...)
// 5. Internal utils/lib (@/lib/...)
// 6. Types (@/types/...)
// 7. Styles (if any)
```

### Performance Rules

1. **Always use `next/image`** for product images (never raw `<img>`)
2. **Dynamic imports** for heavy components: Three.js canvas, chart components, rich text editor
3. **`'use client'` only where needed** — default to server components
4. **Memoize expensive computations** with useMemo
5. **Debounce search inputs** (300ms)
6. **Skeleton loaders** for async content (never blank screens)
7. **Preload critical fonts** in layout.tsx head

### Error Handling

- API errors: Hono error handler returns `{ error: string, code: string }` with appropriate HTTP status
- Frontend: TanStack Query error states → show toast notification + inline error message
- Payment errors: specific error page with retry option, never lose the cart
- 404: Custom page with illustration + "Go Home" link
- 500: Custom error page with "Try Again" + "Contact Support" options

---

## 15. BUILD ORDER (14-Day Sprint)

Follow this exact order. Each day's work depends on the previous day being complete.

### Day 1: Repository Setup + Infrastructure
```
□ Initialize turborepo monorepo with pnpm
□ Set up apps/web (Next.js 14 + TypeScript + Tailwind)
□ Set up apps/api (Cloudflare Workers + Hono)
□ Set up packages/shared (types + validators)
□ Configure Tailwind with full design tokens (colors, fonts, spacing)
□ Download and configure self-hosted fonts (Clash Display, Satoshi, Bespoke Serif)
□ Create globals.css with CSS variables
□ Create Cloudflare resources: Pages project, D1 database, R2 bucket, KV namespaces
□ Run D1 migrations (full schema.sql)
□ Run seed.sql (admin user + categories + products)
□ Deploy empty Workers API + confirm it responds
□ Deploy Next.js to Pages + confirm it loads
□ Set up PhonePe sandbox account
□ Set up Resend account + verify domain
```

### Day 2: API Core + Auth
```
□ Build Hono middleware stack (CORS, logger, rate limiter, analytics)
□ Build auth service (register, login, JWT generation, refresh tokens, password reset)
□ Build product API routes (list, detail, by category, search)
□ Build category API routes
□ Build R2 image upload service
□ Test all routes via curl/Hopsscotch
□ Build shared Zod validators for all entities
□ Build API client (apps/web/src/lib/api.ts) with auth header injection
```

### Day 3: Design Foundation + Layout Components
```
□ Build LenisProvider (smooth scroll)
□ Build root layout.tsx (fonts, providers, metadata)
□ Build Navbar (logo, nav links, search icon, cart icon with count, account icon)
□ Build MobileMenu (full-screen slide-in, Framer Motion)
□ Build Footer (4-column grid, social icons, payment icons)
□ Build AnnouncementBar ("Free shipping on orders over ₹500")
□ Build CartDrawer (slide-in from right)
□ Build storefront layout.tsx (Navbar + Footer wrapper)
□ Build AnimatedText component (anime.js character reveal)
□ Build RevealOnScroll component
□ Build MagneticButton component
□ Build HoneycombLoader component
□ Build GoldenDivider component
□ Build PageTransition component
□ Set up Zustand stores (cart, auth, ui)
```

### Day 4: Homepage (The Big Day)
```
□ Build Hero Section — headline animation, subtext, CTAs, product image float
□ Build Marquee Banner — infinite scroll text
□ Build Featured Products carousel (Embla + ProductCard)
□ Build Brand Story Strip — parallax image + text
□ Build Category Grid — asymmetric grid with hover effects
□ Build "The Process" horizontal scroll section
□ Build Testimonial Carousel
□ Build Newsletter Section (with bee animation)
□ Build Instagram grid section
□ Assemble homepage — connect all sections, test scroll flow
□ Mobile responsive pass on homepage
```

### Day 5: Product Pages
```
□ Build ProductCard component (with hover effects, Quick Add)
□ Build Product Listing page (/shop) — grid, filter bar, sort, pagination
□ Build category filter functionality
□ Build Product Detail page — gallery, info, variants, quantity, accordions
□ Build VariantSelector component
□ Build AddToCartButton (with success animation)
□ Build Related Products section
□ Build Search page (/search)
□ Mobile responsive pass on all product pages
```

### Day 6: Cart + Checkout
```
□ Build Cart API (KV-backed: add, update, remove, get)
□ Build Cart page — items list, quantity adjusters, coupon input, summary
□ Build cart item removal animation
□ Build Checkout page — address form, order summary, PhonePe button
□ Build coupon API (validate, apply) + admin CRUD
□ Build CouponInput component with inline validation
□ Build address form with pincode auto-detection
□ Integrate Cloudflare Turnstile on checkout
□ Mobile responsive pass
```

### Day 7: Payments + Order Flow
```
□ Build PhonePe service (initiate, callback, status check, refund)
□ Build checkout API (create order + initiate payment)
□ Build PhonePe callback handler (verify, update order, deduct stock)
□ Build PhonePe redirect handler (check status, redirect to confirmation/failure)
□ Build Order Confirmation page (with check animation + confetti)
□ Build Payment Failed page (with retry)
□ Build order confirmation email template (Resend)
□ TEST: Complete full purchase flow on PhonePe sandbox
□ TEST: Handle payment failure + retry
□ TEST: Handle callback idempotency (duplicate calls)
```

### Day 8: Customer Accounts
```
□ Build auth pages (Login, Register, Forgot Password)
□ Build Account layout (sidebar with links)
□ Build Profile page (edit name, email, phone)
□ Build Orders page (order history list)
□ Build Order Detail page (items, status timeline, tracking)
□ Build Addresses page (CRUD saved addresses)
□ Build guest cart → user cart merge logic
□ Build order tracking page (/track)
□ Build shipping/delivered email notifications
```

### Day 9: Admin Panel — Core
```
□ Build Admin login page
□ Build Admin layout (sidebar, header, breadcrumbs)
□ Build AdminSidebar component
□ Build DataTable component (sortable, filterable, paginated)
□ Build Dashboard page (KPI cards, revenue chart, recent orders, low stock)
□ Build Products list + create + edit pages
□ Build ImageUploader component (R2 upload, drag-and-drop, reorder)
□ Build Categories management page
□ Build Admin product API routes (CRUD + image upload)
```

### Day 10: Admin Panel — Orders + Customers
```
□ Build Orders list page (filters by status, date, search)
□ Build Order detail page (timeline, items, status update, refund button)
□ Build order status update API (with email trigger)
□ Build refund flow (PhonePe refund API integration)
□ Build Customers list page
□ Build Customer detail page (profile, order history, LTV)
□ Build Coupons management page (CRUD + usage stats)
□ Build Reviews moderation page (approve/reject)
□ Build Media manager page (R2 file browser)
```

### Day 11: Analytics — Backend
```
□ Build client-side tracker (tracker.ts)
□ Integrate tracker: page_view, product_view, add_to_cart, purchase, search, scroll_depth
□ Build server-side Analytics Engine logging middleware
□ Build analytics API endpoints (overview, sales, traffic, funnel, products, customers)
□ Build daily_metrics cron worker (aggregate yesterday's data)
□ Build UTM parameter capture + attribution logic
□ Build analytics export endpoint (CSV)
```

### Day 12: Analytics — Frontend Dashboard
```
□ Build Analytics Overview page (KPI cards with comparison, revenue chart, traffic chart)
□ Build Sales deep-dive page (revenue by day/category/payment, orders by status)
□ Build Traffic page (sources, geo breakdown, device split)
□ Build Conversion Funnel page (visual funnel chart)
□ Build Product Performance page (top products, views→conversion)
□ Build Customer Analytics page (LTV, cohorts, new vs returning)
□ Build Real-time page (live visitors, recent orders, active carts — auto-refresh)
□ Build Admin Settings pages (general, shipping, payments, team)
```

### Day 13: Polish + SEO + Content
```
□ Build About page (editorial layout, parallax, stats counters)
□ Build Contact page (form + map embed + info)
□ Build all Policy pages (privacy, terms, shipping, refund)
□ Add SEO: dynamic meta tags, Open Graph images, JSON-LD product schema
□ Generate sitemap.xml + robots.txt
□ Add structured data to product pages (Product schema)
□ Build 404 page and error page
□ Build PWA manifest + icons
□ Custom cursor implementation (desktop only)
□ Loading states and skeleton screens everywhere
□ Micro-interaction audit: all buttons, links, cards have hover/active states
□ Responsive audit: test every page at 375px, 768px, 1024px, 1440px
□ Performance: lazy load below-fold images, dynamic import heavy components
```

### Day 14: Testing + Launch
```
□ Full E2E test: browse → search → filter → PDP → add to cart → checkout → pay → confirm
□ Test PhonePe production with ₹1 real payment
□ Test all admin flows: product CRUD, order management, refund, analytics
□ Test auth flows: register, login, forgot password, profile edit
□ Test on real devices: iPhone Safari, Android Chrome, desktop browsers
□ Lighthouse audit: target 90+ on mobile for all storefront pages
□ Security audit: auth bypass, IDOR, XSS, payment manipulation
□ Configure Cloudflare WAF rules + rate limiting
□ Point DNS: sumosta.com → Cloudflare Pages
□ Switch PhonePe to production credentials
□ Verify SSL, HSTS, security headers
□ Set up uptime monitoring
□ LAUNCH 🚀
```

---

## QUICK REFERENCE: KEY FILE LOCATIONS

| What | Where |
|------|-------|
| Global CSS + variables | `apps/web/src/app/globals.css` |
| Font configuration | `apps/web/src/lib/fonts.ts` |
| Animation variants | `apps/web/src/lib/animations.ts` |
| Anime.js presets | `apps/web/src/lib/anime-presets.ts` |
| Cart store | `apps/web/src/stores/cart-store.ts` |
| API client | `apps/web/src/lib/api.ts` |
| Analytics tracker | `apps/web/src/lib/tracker.ts` |
| PhonePe service | `apps/api/src/services/phonepe.ts` |
| DB schema | `apps/api/src/db/schema.sql` |
| Hono app entry | `apps/api/src/index.ts` |
| Shared types | `packages/shared/src/types.ts` |
| Shared validators | `packages/shared/src/validators.ts` |

---

**⚠️ CRITICAL REMINDERS FOR CLAUDE CODE:**

1. **Never use Google Fonts CDN** — all fonts are self-hosted in /public/fonts/
2. **Never use pure white (#FFFFFF) on the storefront** — use --cream (#FFFDF8)
3. **Always check prefers-reduced-motion** before any animation
4. **Always use parameterized queries** for D1 — never string-concatenate SQL
5. **Always verify PhonePe checksum** on callbacks — never trust client-side amounts
6. **Always use `next/image`** — never raw `<img>` tags
7. **Cart is KV-backed**, not localStorage — must survive across devices when logged in
8. **Admin panel uses shadcn/ui** — storefront uses custom components with Framer Motion
9. **pnpm only** — never npm or yarn
10. **Test PhonePe sandbox** before ANY production payment code
